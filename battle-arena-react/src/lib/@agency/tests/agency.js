import Console from "../util/Console";

import Agency from "../core/Agency";
import Agent from "../core/Agent";
import Message from "../core/comm/Message";

Console.NewContext();

// const agency = new Agency();
// console.log(agency.id);

const agent = new Agent({
	triggers: [
		["test", [
			// ([ ...args ], payload) => console.log(...args),
			([ ...args ], payload) => console.log(1111),
			([ ...args ], payload) => console.log(2222),
			([ ...args ], payload) => console.log(3333),
		]],
	],
});
console.log(agent.id);
console.log(agent);

agent.invoke("test", Date.now());
agent.invoke(Message.Create("catscatscats", "test"));