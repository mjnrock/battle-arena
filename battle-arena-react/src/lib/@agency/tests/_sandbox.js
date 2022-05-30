import Console from "../util/Console";

import Agent from "../core/Agent";

Console.NewContext();

const agent = new Agent({
	id: "catscatscats",
	state: {
		cats: 2,
	},
	events: {
		cat: [
			(state, ...args) => {
				return { cats: state.cats + 5 };
			},
			(state, ...args) => {
				return { cats: state.cats + 5 };
			},
		],
	},
	// hooks: {
	// 	filter: (trigger, ...args) => {
	// 		console.log(`FILTER`, ...args);
	
	// 		return false;
	// 	},
	// },
});

agent.addEvents({
	cat: [
		(state, ...args) => {
			return { cats: state.cats + 5 };
		},
		(state, ...args) => {
			return { cats: state.cats + 5 };
		},
	],
});
agent.addHooks({
	// mutator: (trigger, ...args) => {
	// 	console.log(`MUTATOR`, ...args);

	// 	return [ 4, 5, 6 ];
	// },
	// filter: (trigger, ...args) => {
	// 	console.log(`FILTER`, ...args);

	// 	return false;
	// },
	update: (trigger, { previous, state }, ...args) => console.log(`UPDATE`, previous, state),
	// effect: (trigger, ...args) => console.log(`EFFECT`, ...args),
});
// agent.addHooks([
// 	[ `mutator`, [ (trigger, ...args) => {
// 		console.log(`MUTATOR`, ...args);

// 		return args;
// 	} ] ],
// 	[ `filter`, [ (trigger, ...args) => {
// 		console.log(`FILTER`, ...args);

// 		return false;
// 	} ] ],
// 	[ `update`, (trigger, ...args) => console.log(`UPDATE`, ...args), ],
// 	[ `effect`, (trigger, ...args) => console.log(`EFFECT`, ...args), ],
// ]);

//?	Test instantiation of Agent and trigger "cat" handlers
// console.log(agent.state)
// agent.trigger("cat", Date.now());
// console.log(agent.state)

//?	Test trigger "cat" handlers and middleware execution of .emit
// console.log(agent.state)
// agent.emit("cat", Date.now());
// console.log(agent.state)

agent.config.batchSize = 2
agent.config.isBatchProcessing = true;
agent.emit("cat", Date.now(), 1);
agent.emit("cat", Date.now(), 2);
agent.emit("cat", Date.now(), 3);
console.log(agent.state)
agent.process();
console.log(agent.state)