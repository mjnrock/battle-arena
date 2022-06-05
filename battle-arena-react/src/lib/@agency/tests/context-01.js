import Console from "../util/Console";

import Context from "../core/Context";
import Agent from "../core/Agent";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

const [ a1, a2, a3 ] = Agent.Factory(3, {
	state: {},
	events: {
		test: (state, ...args) => {
			console.log(123, ...args);
		},
	},
	hooks: {
		[ Agent.Hooks.EFFECT ]: (trigger, payload) => {

			console.log(456, payload.args);
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
	console.log(987, agent.id, payload.args);
});
// a2.emit(`test`, Date.now());	// Should see this one
// a2.addHook(Agent.Hooks.MUTATOR, (trigger, result, ...args) => {
// 	console.log(8888888, trigger, result, ...args)

// 	return [ `CATS-${ Date.now() }` ];
// });

//? Test member triggers
// ctx.triggerAll(`test`, Date.now());	// Should see this one twice (a1 and a2)
// ctx.triggerAt(a1.id, `test`, Date.now());	// Should see this one once (a1)
// ctx.triggerAt(a2.id, `test`, Date.now());	// Should see this one once (a2)
// ctx.triggerSome([ a2.id ], `test`, Date.now());	// Should see this one once (a2)
// ctx.triggerSome(() => true, `test`, Date.now());	// Should see this one twice (a1 and a2)

//? Test member emissions
// ctx.emitAll(`test`, Date.now());	// Should see this one twice (a1 and a2)
// ctx.emitAt(a1.id, `test`, Date.now());	// Should see this one once (a1)
// ctx.emitAt(a2.id, `test`, Date.now());	// Should see this one once (a2)
// ctx.emitSome([ a2.id ], `test`, Date.now());	// Should see this one once (a2)
// ctx.emitSome(() => true, `test`, Date.now());	// Should see this one twice (a1 and a2)

//? Test Context FILTER hook
// a2.addHook(Agent.Hooks.FILTER, (trigger, result, ...args) => {
// 	console.log(7777777, trigger, result, ...args)
// 	return true;
// });
// a2.emit(`test`, Date.now());	// Should NOT see this one