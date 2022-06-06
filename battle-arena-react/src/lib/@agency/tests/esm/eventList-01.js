import Console from "../../util/Console";

import Context from "../../core/Context";
import Agent from "../../core/Agent";
import EventList from "./../../core/EventList";

Console.NewContext("This test suite is designed to test the templatization of handlers via the EventList class.");

const el = new EventList({
	test: (state, ...args) => {
		console.log(123, ...args);
	},
	test2: (state, ...args) => {
		console.log(456, ...args);
	},
}, {
	test2: "cats",
});
//? Alias array syntax
// }, [
// 	[ "test2", "cats" ],
// ]);

// console.log(el);
// console.log(el.toEventObject());

const [ a1, a2, a3 ] = Agent.Factory(3);

// console.log(a1.events);
// el.attach(a1);
// console.log(a1.events);

const ctx = new Context([ a1, a2, a3 ], {
	events: el.toEventObject({
		fish: "skwrlz",		// Overwrite the default alias with a custom one
	}, {
		fish: () => 1,
	}),
});
console.log(ctx.events);