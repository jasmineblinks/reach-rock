import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const startingBalance = stdlib.parseCurrency(100);
const accountAlice = await stdlib.newTestAccount(startingBalance);
const accountBob = await stdlib.newTestAccount(startingBalance);

const ctcAlice = accountAlice.contract(backend);
const ctcBob = accountBob.contract(backend, ctcAlice.getInfo());
await Promise.all([
    ctcAlice.p.Alice({
        // implement Alice's interact object here
    }),
    ctcBob.p.Bob({
        // implement Bob's interact object here
    }),
]);