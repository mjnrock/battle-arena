import Console from "../util/Console";

import Agent from "../core/Agent";

Console.NewContext();

const agent = new Agent({
	id: "catscatscats",
	state: {
		test: "test",
	},
	triggers: {
		//*	Command Handlers
		[ `#mutator` ]: (...args) => args,
		[ `#filter` ]: (...args) => false,
		[ `#update` ]: (...args) => console.log(`UPDATE`, ...args),
		[ `#effect` ]: (...args) => console.log(`EFFECT`),

		//*	Reducers
		cat: [
			(state, ...args) => {
				console.log(1111, state, ...args)

				return { cats: 5 };
			},
			(state, ...args) => {
				console.log(2222, state, ...args)

				return { cats: (state.cats || 3) + 15 };
			},
		],
	},
});

//?	Test instantiation of Agent and trigger "cat" handlers
// console.log(agent)
// agent.trigger("cat", Date.now());

//?	Test trigger "cat" handlers and middleware execution of .emit
console.log(agent.state)
agent.emit("cat", Date.now());
console.log(agent.state)