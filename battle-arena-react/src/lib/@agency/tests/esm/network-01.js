import Console from "../../util/Console";

import Agent from "../../core/Agent";

import Message from "../../core/comm/Message";
import Channel from "../../core/comm/Channel";
import Network from "../../core/comm/Network";

Console.NewContext("This test suite validates the usage of Network and Channel working together.");

const [ a1, a2, a3 ] = Agent.Factory(3, {
	state: {
		$eval: true,
		aid: agent => agent.id,
	},
	events: {
		[ Channel.MessageTrigger ]: (state, ...args) => {
			Console.label("reducer 1", state, ...args);
			// Console.label("reducer 1", ...args);
		},
	},
});

const c1 = new Channel({
	config: {
		retainHistory: false,
		// maxHistory: 2,
		// atMaxReplace: false,
	},
});
const c2 = new Channel({
	config: {
		retainHistory: false,
		// maxHistory: 2,
		// atMaxReplace: false,
	},
});

const network = new Network([
	c1,
	c2,
]);

network.addSubscriberTo(c2, a1);
network.addSubscriberTo(c1, a2);

// console.log(network)
// console.log(network[ channel.id ])
// console.log(network[ channel2.id ])

// network.sendTo(c2, new Message({ data: Date.now(), tags: `date` }));
// network.sendTo(c2, new Message({ data: Date.now(), tags: `date` }));
// network.sendTo(c1, new Message({ data: Date.now(), tags: `date` }));
network.broadcast(new Message({ data: Date.now(), tags: `date` }));