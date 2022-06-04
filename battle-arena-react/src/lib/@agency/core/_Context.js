import { validate } from "uuid";

import Agent from "./Agent";

/**
 * A centralized Agent factory and messaging center.
 * A Context handler should *always* respond to the target as the second parameter [ e.g. (trigger, target, ...payload) ]
 */
export class Context extends Agent {
	constructor(agents = [], agentObj = {}) {
		super({
			config: {
				isReducer: false,
			},
			...agentObj,
		});

		this.registry = new Map();
		this.receiver = agent => (effect, ...args) => this.$route.call(this, agent, ...args);
		this.registerAgent(...agents);	// Seed Context with an initial group of Agents

		this.hook(Agent.Hooks.GET, (target, prop, value) => {
			const entry = target.registry.get(prop);

			if(entry) {
				if(validate(entry)) {
					return target.registry.get(entry);
				}

				return entry;
			}
		});
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

	/**
	 * Add @agents to the registry and attach the receiver fn as an effect handler
	 */
	registerAgent(...agents) {
		for(let agent of agents) {
			this.registry.set(agent.id, agent);
			agent.addTrigger(agent.config.triggers.effect, this.receiver(agent));
		}


		return this;
	}
	/**
	 * Undo .register
	 */
	unregisterAgent(...agents) {
		for(let agent of agents) {
			this.registry.delete(agent.id);
			agent.removeTrigger(agent.config.triggers.effect, this.receiver(agent));	//TODO This isn't going to unassign correctly
		}


		return this;
	}

	getAgent(id) {
		const agent = this.registry.get(id);

		if(agent instanceof Agent) {
			return agent;
		}

		return false;
	}
	hasAgent(agentOrId) {
		const id = validate(agentOrId) ? agentOrId : agentOrId.id;

		return this.registry.has(id);
	}
	addAgent(agent, ...aliases) {
		this.registerAgent(agent);
		this.addAlias(agent, ...aliases);

		return this;
	}
	removeAgent(agent) {
		this.unregisterAgent(agent);
		for(let [ key, value ] of Object.entries(this.registry)) {
			if(key === agent.id || value === agent.id) {	// Remove id and aliases
				this.registry.delete(key);
			}
		}

		return this;
	}

	_makeAlias(agent) {}
	hasAlias(alias) {
		return this.registry.has(alias);
	}
	addAlias(agentOrId, ...aliases) {
		const id = validate(agentOrId) ? agentOrId : agentOrId.id;

		for(let alias of aliases) {
			this.registry.set(alias, id);
		}

		return this;
	}
	removeAlias(...aliases) {
		for(let alias of aliases) {
			this.registry.delete(alias);
		}

		return this;
	}

	/**
	 * Instantiate @qty Agents and immediately .register them
	 */
	spawn(qty = 1, fnOrObj) {
		const agents = Agent.Factory(qty, fnOrObj, (agent) => {
			this.registerAgent(agent);
		});

		return agents;
	}
	/**
	 * Undo .spawn and terminate the Agent
	 */
	despawn(...agents) {
		for(let agent of agents) {
			this.unregisterAgent(agent);

			agent.terminate();
		}

		return this;
	}

	
	forEach(fn, selector) {
		const results = new Map();

		if(typeof fn === "function") {
			let entries;
			if(typeof selector === "function") {
				entries = this.filter(selector);
			} else {
				entries = this.registry.values();
			}

			for(let agent of entries) {
				results.set(agent.id, fn(agent, this));
			}
		}

		return results;
	}
	get map() {
		return this.forEach;
	}
	filter(fn) {
		const results = new Map();
		for(let agent of this.registry.values()) {
			if(fn(agent) === true) {
				results.set(agent.id, agent);
			}
		}

		return results;
	}
	reduce(fn, initialValue) {
		let result = initialValue;

		if(typeof fn === "function") {
			for(let agent of this.registry.values()) {
				result = fn(agent, result);
			}
		}

		return result;
	}

	exchange(context, ...agents) {
		const [ selector ] = agents;

		if(typeof selector === "function") {
			agents = selector(context, this);
		}

		for(let agent of agents) {
			context.register(agent);
			this.unregisterAgent(agent);
		}

		return this;
	}

	/**
	 * Overload self for differentiation in handlers
	 */
	trigger(trigger, ...args) {
		return this.invoke(trigger, this, ...args);
	}

	/**
	 * Call << .invoke >> on all Agents in the .registry
	 */
	send(trigger, ...args) {
		for(let agent of Object.values(this.registry)) {
			if(agent instanceof Agent) {
				agent.invoke(trigger, ...args);
			}
		}

		return this;
	}
	/**
	 * Easily send to an Agent by passing that Agent's .id
	 * Optionally, id can be (nested) id[], to pass the same data to multiple Agents
	 */
	sendTo(id, trigger, ...args) {
		if(Array.isArray(id)) {
			for(let i of id) {
				this.sendTo(i, trigger, id);
			}

			return this;
		}

		const agent = this.registry.get(id);

		if(agent instanceof Agent) {
			return agent.invoke(trigger, ...args);
		}

		return this;
	}
};

export default Context;