import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);
const accountAlice = await stdlib.newTestAccount(startingBalance);
const accountBob = await stdlib.newTestAccount(startingBalance);

const ctcAlice = accountAlice.contract(backend);
const ctcBob = accountBob.contract(backend, ctcAlice.getInfo());

const HAND = ['Rock', 'Paper', 'Scissors'];
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
const Player = (Who) => ({
    getHand: () => {
        const hand = Math.floor(Math.random() * 3);
        console.log(`${Who} played ${HAND[hand]}`);
        return hand;
    },
    seeOutcome: (outcome) => {
        console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
    },
});

await Promise.all([
    ctcAlice.p.Alice({
        // implement Alice's interact object here
        ...Player('Alice'),
    }),
    ctcBob.p.Bob({
        // implement Bob's interact object here
        ...Player('Bob'),
    }),
]);