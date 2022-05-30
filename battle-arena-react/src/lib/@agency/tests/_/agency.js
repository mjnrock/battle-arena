import Console from "../../util/Console";

import Context from "../../core/Context";
import Agent from "../../core/Agent";
import Message from "../../core/comm/Message";

Console.NewContext();

// const agency = new Agency();
// console.log(agency.id);

const agent = new Agent({
	triggers: [
		["cat", [
			(...args) => console.log(1111),
			(...args) => console.log(2222),
			(...args) => console.log(3333),
		]],
		["test", [
			(...args) => console.log(...args),
		]],
		["*test", [
			(...args) => false,
		]],
		["*cat", [
			(...args) => false,
		]],
		["**test", [
			(...args) => console.log("EFFECT: test"),
		]],
		["**cat", [
			(...args) => console.log("EFFECT: cat"),
		]],
	],
	config: {
		generatePayload: false,
	},
});
// console.log(agent.id);
// console.log(agent);

agent.invoke("test", Date.now());
// agent.invoke(Message.Create("catscatscats", "test"));