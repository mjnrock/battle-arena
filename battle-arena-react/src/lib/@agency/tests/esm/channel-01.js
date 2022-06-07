import Console from "../../util/Console";

import Agent from "./../../core/Agent";

import Message from "../../core/comm/Message";
import Channel from "../../core/comm/Channel";

Console.NewContext("This test suite is designed to test the templatization of handlers via the EventList class.");

const [ a1, a2, a3 ] = Agent.Factory(3, {
	// state: (agent) => ({ fish: Math.random() * 100 }),	// State can be dynamically evaluated each time an Agent is constructed
	state: {
		$eval: true,
		num: (agent) => {
			// Console.label("test", agent.id);

			return ~~(Math.random() * 1000);
		},
	},
	events: {
		[ Channel.MessageTrigger ]: (state, ...args) => {
			Console.label("reducer 1", state, ...args);
			// Console.label("reducer 1", ...args);
		},
	},
});

const channel = new Channel({
	config: {
		retainHistory: false,
		maxHistory: 2,
		atMaxReplace: false,
	},
});

channel.addSubscriber(a1);
channel.addSubscriber(a2);
channel.addSubscriber(a3);

Console.label("a1", a1.id);
Console.label("a2", a2.id);
Console.label("a3", a3.id);

Console.hr();
const message = new Message({ data: Date.now(), tags: `date` });
Console.label("message1", message);
channel.sendMessage(message);
console.log(channel.messages);
setTimeout(() => {
	Console.hr();
	const message2 = new Message({ data: Date.now(), tags: `date` });
	Console.label("message2", message2);
	channel.sendMessage(message2);
	console.log(channel.messages);
}, 100)	;


// console.log(channel.subscriptions.values);
// // channel.removeSubscriber(a2);
// channel.removeSubscriber(a2.id); 
// Console.hr();
// console.log(channel.subscriptions.values);