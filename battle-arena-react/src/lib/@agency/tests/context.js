import Console from "../util/Console";

import Context from "../core/Context";
import Agent from "../core/Agent";


Console.NewContext();

const [ a1, a2, a3 ] = Agent.Factory(3, {
	state: {},
	events: {
		test: (state, ...args) => {
			console.log(123, ...args);
		},
	},
	hooks: {
		[ Agent.Hooks.EFFECT ]: (trigger, payload) => {

			console.log(456, payload);
		},
	}
});
const ctx = new Context([ a1, { cats: Infinity } ]);

console.log(ctx.id)
console.log(ctx.size)	// Assert: 1, not 2

ctx.addAgent(a2);
console.log(ctx.size)	// Assert: 2, not 3

console.log(a2);

ctx.addHook(Context.Hooks.RECEIVE, (trigger, agent, payload) => {
	console.log(987, agent.id, payload);
});
a2.emit(`test`, Date.now());	// Should see this one
a2.addHook(Agent.Hooks.MUTATOR, (trigger, result, ...args) => {
	console.log(8888888, trigger, result, ...args)

	return [ `CATS-${ Date.now() }` ];
});
a2.addHook(Agent.Hooks.FILTER, (trigger, result, ...args) => {
	console.log(7777777, trigger, result, ...args)
	return true;
});
a2.emit(`test`, Date.now());	// Should NOT see this one