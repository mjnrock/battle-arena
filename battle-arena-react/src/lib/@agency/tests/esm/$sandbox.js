import Console from "../../util/Console";

import Agent from "../../core/Agent";

Console.NewContext();

const agent = new Agent({
	id: "catscatscats",
	state: {
		cats: 2,
	},
	config: {
		// allowMultipleHandlers: false,
	},
	events: {
		cat: [
			(state, ...args) => {
				return { cats: state.cats + 5 };
			},
		],
	},
});

console.log(agent)
console.log(agent.state)
agent.emit("cat")
console.log(agent.state)