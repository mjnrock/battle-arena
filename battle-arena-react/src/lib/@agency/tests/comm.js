import Agency from "../core/Agency";
import Agent from "../core/Agent";

import Message from "../core/comm/Message";

const agency = new Agency();
const agent = new Agent();
// console.log(agency.id);
// console.log(agent.id);

const msg = Message.Generate(123435, [ "test", "cat" ], {
	info: {
		isLocked: true,
	},
});
console.log(msg)
console.log(msg.type)

console.log(msg.data)
msg.info.isLocked = false;
msg.data = 9874;
console.log(msg.data)