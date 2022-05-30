import Console from "../util/Console";

import Agent from "../core/Agent";
import Context from "../core/Context";

Console.NewContext();

// const agency = new Agency();
// console.log(agency.id);

const [ agent, agent2 ] = Agent.Factory(2, {
	triggers: [
		[ "cat", [
			(state, ...args) => {
				console.log(1111, state, ...args);
			},
		] ],
	],
});
//? "cat" was fired, @context's "@effect" hook should capture [ "cat", Date.now() ]
const context = new Context([
	agent,
	agent2,
], {
	triggers: [
		[ "@router", [
			function(agent, trigger, ...args) {
				console.log(2222, this.id, this.state, agent.id, trigger, ...args);

				//TODO Create a basic router system for Entity, Node, World (Managers)

				if(trigger === "cat") {
					return [
						trigger,
						...args,
					];
				}

				return false;	//? Return false to prevent further invocation
			},
		] ],
		[ "cat", [
			(state, ...args) => {
				console.log(3333, state, ...args);
			},
		] ],
	],
});

console.log(`[Agent 1]:`, agent.id);
console.log(`[Agent 2]:`, agent2.id);
console.log(`[Context]:`, context.id);

agent.trigger("cat", Date.now())
agent2.trigger("cat", Date.now())
agent.trigger("catzz", Date.now())


//?	Agent.triggers.$post should be present, then be removed
// console.log(agent);
// context.unregister(agent)
// console.log(agent);

//? All Agents should fire and Context should repeat each
// console.log(context);
// agent.trigger("cat", Date.now())
// agent2.trigger("cat", Date.now())