import Agent from "./Agent";
import { Registry, RegistryEntry } from "./Registry";

export class Context extends Agent {
	static Hooks = {
		...Agent.Hooks,

		RECEIVE: "receive",
	};

	constructor(agents = [], agentObj = {}) {
		super(agentObj);

		this.registry = new Registry();
		//* Override encoder to allow only Agents to be added to the registry
		this.registry.encoder = function(id, entry, type = RegistryEntry.Type.VALUE) {
			if(entry instanceof Agent) {
				this.registry.set(id, new RegistryEntry(id, entry, type));

				return true;
			}

			return false;
		};

		//?	Verify that you can un/register this function as expected, or if this creates a variable reference
		this.receiver = (agent) => (trigger, payload) => this.hook(Context.Hooks.RECEIVE, trigger, [ agent, payload ]);
		this.addAgent(...agents);
	}

	//#region Agent Membership
	__attachReceiver(agent) {
		agent.addHook(Agent.Hooks.EFFECT, this.receiver(agent));

		return this;
	}
	__detachReceiver(agent) {
		agent.removeHook(Agent.Hooks.EFFECT, this.receiver(agent));

		return this;
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
	
	addAgent(...agents) {
		for(let agent of agents) {
			if(agent instanceof Agent) {
				this.registry.set(agent.id, agent);
				this.__attachReceiver(agent);
			}
		}
		
		return this;
	}
	removeAgent(...agents) {
		for(let agent of agents) {
			this.registry.delete(agent.id);
			this.__detachReceiver(agent);
		}

		return this;
	}
	//#endregion Agent Membership
	
	//#region Agent Events
	triggerAt(aid, trigger, ...args) {
		const agent = this.registry.get(aid);

		if(agent) {
			return agent.trigger(trigger, ...args);
		}
	}
	triggerAll(trigger, ...args) {
		const results = [];
		for(let agent of this.registry.iterator) {
			results.push(agent.trigger(trigger, ...args));
		}

		return results;
	}
	triggerSome(aid = [], trigger, ...args) {
		const results = [];
		
		if(!Array.isArray(aid)) {
			aid = [ aid ];
		}
		
		for(let agent of this.registry.iterator) {
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
		for(let agent of this.registry.iterator) {
			results.push(agent.emit(trigger, ...args));
		}

		return results;
	}
	emitSome(aid = [], trigger, ...args) {
		const results = [];
		
		if(!Array.isArray(aid)) {
			aid = [ aid ];
		}

		for(let agent of this.registry.iterator) {
			if(typeof aid === "function" && aid(agent) === true) {
				results.push(agent.emit(trigger, ...args));
			} else if(aid.includes(agent.id)) {
				results.push(agent.emit(trigger, ...args));
			}
		}
		
		return results;
	}
	//#endregion Agent Events

	//#region Registry Convenience Methods
	/**
	 * Allow a Context to iterate over all Agents in the .registry
	 */
    [ Symbol.iterator ]() {
        var index = -1;
        var data = this.registry.iterator;

        return {
            next: () => ({ value: data[ ++index ], done: !(index in data) })
        };
    }
	get size() {
		return this.registry.size;
	}

	addAlias(agent, ...aliases) {
		this.registry.addAlias(agent, ...aliases);

		return this;
	}
	removeAlias(agent, ...aliases) {
		this.registry.removeAlias(agent, ...aliases);

		return this;
	}	
	setPool(tag, ...agents) {
		this.registry.setPool(tag, ...agents);

		return this;
	}
	getPool(tag) {
		return this.registry.getPool(tag);
	}
	addToPool(tag, ...agents) {
		this.registry.addToPool(tag, ...agents);

		return this;
	}
	//#endregion Registry Convenience Methods
};

export default Context;