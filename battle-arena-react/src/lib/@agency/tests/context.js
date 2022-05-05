import Console from "../util/Console";

import Agent from "../core/Agent";
import Context from "../core/Context";
import Message from "../core/comm/Message";

Console.NewContext();

// const agency = new Agency();
// console.log(agency.id);

const [ agent, agent2 ] = Agent.Factory(2, {
	triggers: [
		["cat", [
			(...args) => console.log(1111),
		]],
	],
});
const context = new Context([
	agent,
	agent2,
], {
	triggers: [
		["$router", [
			(...args) => {
				console.log(3333);

				return [
					"cat"
				];
			},
		]],
		["cat", [
			(...args) => console.log(2222),
		]],
	],
});

//?	Agent.triggers.$post should be present, then be removed
// console.log(agent);
// context.unregister(agent)
// console.log(agent);

//? All Agents should fire and Context should repeat each
// console.log(context);
agent.trigger("cat", Date.now())
agent2.trigger("cat", Date.now())