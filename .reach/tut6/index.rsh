'reach 0.1';

const [isHand, ROCK, PAPER, SCISSORS] = makeEnum(3);
const [isOutcome, B_WINS, DRAW, A_WINS] = makeEnum(3);

// Move computation and declare the formula with winner.
const winner = (handAlice, handBob) =>
    ((handAlice + (4 - handBob)) % 3);

// Assertions to make sure that each are being checked for.
assert(winner(ROCK, PAPER) == B_WINS);
assert(winner(PAPER, ROCK) == A_WINS);
assert(winner(ROCK, ROCK) == DRAW);

forall(UInt, handAlice =>
    forall(UInt, handBob =>
        assert(isOutcome(winner(handAlice, handBob)))));

forall(UInt, (hand) =>
    assert(winner(hand, hand) == DRAW));

const Player = {
    ...hasRandom, // <--- new!
    getHand: Fun([], UInt),
    seeOutcome: Fun([UInt], Null),
    informTimeout: Fun([], Null),
};

export const main = Reach.App(() => {
    const Alice = Participant('Alice', {
        // Specify Alice's interact interface here
        ...Player,
        wager: UInt, // atomic units of currency
        deadline: UInt, // time delta (blocks/rounds)
    });
    const Bob = Participant('Bob', {
        // Specify Bob's interact interface here
        ...Player,
        acceptWager: Fun([UInt], Null),
    });
    init();

    // Initiate timeout
    const informTimeout = () => {
        each([Alice, Bob], () => {
            interact.informTimeout();
        });
    };
    // Write your program here
    Alice.only(() => {
        const wager = declassify(interact.wager);
        const _handAlice = interact.getHand();
        const [_commitAlice, _saltAlice] = makeCommitment(interact, _handAlice);
        const commitAlice = declassify(_commitAlice);
        const deadline = declassify(interact.deadline);
    });
    Alice.publish(wager, commitAlice, deadline).pay(wager);
    commit();

    unknowable(Bob, Alice(_handAlice, _saltAlice));
    Bob.only(() => {
        interact.acceptWager(wager);
        const handBob = declassify(interact.getHand());
    });
    // Make sure that Bob participates otherwise Alice's initial wager will be lost to her.
    Bob.publish(handBob).pay(wager).timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));;
    commit();

    Alice.only(() => {
        const saltAlice = declassify(_saltAlice);
        const handAlice = declassify(_handAlice);
    });
    Alice.publish(saltAlice, handAlice).timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
    checkCommitment(commitAlice, saltAlice, handAlice);

    const outcome = winner(handAlice, handBob);
    const [forAlice, forBob] = outcome == A_WINS ? [2, 0] : outcome == B_WINS ? [0, 2] : [1, 1];
    transfer(forAlice * wager).to(Alice);
    transfer(forBob * wager).to(Bob);
    commit();

    each([Alice, Bob], () => {
        interact.seeOutcome(outcome);
    });
});