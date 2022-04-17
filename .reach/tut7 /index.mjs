import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

// Starting balance for each: Alice and Bob
const startingBalance = stdlib.parseCurrency(100);
const accountAlice = await stdlib.newTestAccount(startingBalance);
const accountBob = await stdlib.newTestAccount(startingBalance);

// Balance transations
const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
const beforeAlice = await getBalance(accountAlice);
const beforeBob = await getBalance(accountBob);

// Contract deployment
const ctcAlice = accountAlice.contract(backend);
const ctcBob = accountBob.contract(backend, ctcAlice.getInfo());

const HAND = ['Rock', 'Paper', 'Scissors'];
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
const Player = (Who) => ({
    ...stdlib.hasRandom, // <--- new!
    getHand: async () => { // <-- async now
        const hand = Math.floor(Math.random() * 3);
        console.log(`${Who} played ${HAND[hand]}`);
        if (Math.random() <= 0.01) {
            for (let i = 0; i < 10; i++) {
                console.log(`  ${Who} takes their sweet time sending it back...`);
                await stdlib.wait(1);
            }
        }
        return hand;
    },
    seeOutcome: (outcome) => {
        console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
    },
    informTimeout: () => {
        console.log(`${Who} observed a timeout`);
    },
});

await Promise.all([
    ctcAlice.p.Alice({
        // implement Alice's interact object here
        ...Player('Alice'),
        wager: stdlib.parseCurrency(5),
        deadline: 10,
    }),
    ctcBob.p.Bob({
        // implement Bob's interact object here
        ...Player('Bob'),
        acceptWager: (amt) => {
            console.log(`Bob accepts the wager of ${fmt(amt)}.`);
        },
    }),
]);

// Once computation is done, display the balance
const afterAlice = await getBalance(accountAlice);
const afterBob = await getBalance(accountBob);

console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
console.log(`Bob went from ${beforeBob} to ${afterBob}.`);