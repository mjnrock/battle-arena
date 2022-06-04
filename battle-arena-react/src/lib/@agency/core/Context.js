import Agent from "./Agent";
import { Registry } from "./Registry";

export class Context extends Agent {
	static Hooks = {
		...Agent.Hooks,

		RECEIVE: "receive",
	};

	constructor(agents = [], agentObj = {}) {
		super(agentObj);

		//*	this.registry = new Registry();
		this.registry = new Map();
		
		//?	Verify that you can u/register this function as expected, or if this creates a variable reference
		this.receiver = (agent) => (...args) => this.trigger(Context.Hooks.RECEIVE, [ agent, args ]);
		this.registerAgent(...agents);
	}

	getAgent(aid) {
		return this.registry.get(aid);
	}
	getAgents(...aids) {
		const results = new Map();

		for(let aid of aids) {
			const agent = this.getAgent(aid);

			if(agent) {
				results.set(aid, agent);
			} else {
				results.set(aid, false);
			}
		}

		return results;
	}
	hasAgent(aid) {
		return this.registry.has(aid);
	}
	hasAgents(...aids) {
		const results = new Map();

		for(let aid of aids) {
			results.set(aid, this.hasAgent(aid));
		}

		return results;
	}
	
	attachReceiver(agent) {
		agent.addEvent(Agent.Hooks.EFFECT, this.receiver(agent));

		return this;
	}
	registerAgent(...agents) {
		for(let agent of agents) {
			if(agent instanceof Agent) {
				this.registry.set(agent.id, agent);
				this.attachReceiver(agent);
			}
		}
		
		return this;
	}
	detachReceiver(agent) {
		agent.removeEvent(Agent.Hooks.EFFECT, this.receiver(agent));

		return this;
	}
	unregisterAgent(...agents) {
		for(let agent of agents) {
			this.registry.delete(agent.id);
			this.detachReceiver(agent);
		}

		return this;
	}

	/**
	 * Allow a Context to iterate over all Agents in the .registry
	 */
    [ Symbol.iterator ]() {
        var index = -1;
        var data = Array.from(this.registry.values());

        return {
            next: () => ({ value: data[ ++index ], done: !(index in data) })
        };
    }
	
	triggerAt(aid, trigger, ...args) {
		const agent = this.registry.get(aid);

		if(agent) {
			return agent.trigger(trigger, ...args);
		}
	}
	triggerAll(trigger, ...args) {
		const results = [];
		for(let agent of this.registry.values()) {
			results.push(agent.trigger(trigger, ...args));
		}

		return results;
	}
	triggerSome(aid = [], trigger, ...args) {
		const results = [];
		
		if(!Array.isArray(aid)) {
			aid = [ aid ];
		}
		
		for(let agent of this.registry.values()) {
			if(typeof aid === "function" && aid(agent) === true) {
				results.push(agent.trigger(trigger, ...args));
			} else if(aid.includes(agent.id)) {
				results.push(agent.trigger(trigger, ...args));
			}
		}

		return results;
	}

	emitAt(aid, trigger, ...args) {
		const agent = this.registry.get(aid);

		if(agent) {
			return agent.emit(trigger, ...args);
		}
	}
	emitAll(trigger, ...args) {
		const results = [];
		for(let agent of this.registry.values()) {
			results.push(agent.emit(trigger, ...args));
		}

		return results;
	}
	emitSome(aid = [], trigger, ...args) {
		const results = [];
		
		if(!Array.isArray(aid)) {
			aid = [ aid ];
		}

		for(let agent of this.registry.values()) {
			if(typeof aid === "function" && aid(agent) === true) {
				results.push(agent.emit(trigger, ...args));
			} else if(aid.includes(agent.id)) {
				results.push(agent.emit(trigger, ...args));
			}
		}
		
		return results;
	}
};

export default Context;