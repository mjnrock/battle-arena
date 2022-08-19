import Console from "../../util/Console";

import Context from "../../core/Context";
import Agent from "../../core/Agent";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

const [ a1, a2, a3 ] = Agent.Factory(3, {
	events: {
		test: (state, ...args) => {
			console.log(123, ...args);
		},
	}
});
const ctx = new Context([ a1, a2, a3 ], {
	events: {
		test2: (state, ...args) => {
			console.log(456, ...args);
		},
	},
});

//? Test 1: Add a router handler to a collection of agents.
// const handler = ctx.addRouter("test2", [ "test" ], a1, a2, a3);		// Add a router to the agents
// a1.emit("test", Date.now());
// console.log(a2.events)		// Expect to see the router handler in the agent's handlers
// ctx.removeRouter(handler, [ "test" ], a1, a2, a3);		// Remove the router from the agents
// a1.emit("test", Date.now());
// console.log(a2.events)		// Expect NOT to see the router handler in the agent's handlers

//? Test 2: Add a router handler to all context agents.
ctx.addRouterAll("test2", "test");		// Add a router to all agents
a1.emit("test", Date.now());
a2.emit("test", Date.now());
ctx.removeRouterAll("test");			// Remove the router from all agents
a1.emit("test", Date.now());
a2.emit("test", Date.now());