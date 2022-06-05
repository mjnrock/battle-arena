import { singleOrArrayArgs } from "../util/helper";
import Agent from "./Agent";
import { Registry, RegistryEntry } from "./Registry";

/**
 * The Context has two (2) main methods for capturing event-firing on registered Agents:
 * 		1. Receiver: This method fires from the Agent's EFFECT hook, passing the event name and arguments.
 * 			e.g. Any event is fired from the Agent, and the Context captures the event in a RECEIVE hook.
 * 		2. Router: This method fires from a specific Agent event, optionally halting propagation via a config setting, and redirecting the event to a Context .emit of the same
 * 			e.g With a "test"::"test2" map, if an Agent fires a "test" event, it may stop at the FILTER, and the Context emit "test2" event with the same ...args.
 */
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

		this.mergeConfig({
			attachReceiver: false,
			preventPropagation: false,
			routers: new Map(),
		}, true);

		//?	Verify that you can un/register this function as expected, or if this creates a variable reference
		this.receiver = (agent) => (trigger, payload) => this.hook(Context.Hooks.RECEIVE, trigger, [ agent, payload ]);
		this.addAgent(...agents);
	}

	//#region Agent Membership
	attachReceiver(agent) {
		agent.addHook(Agent.Hooks.EFFECT, this.receiver(agent));

		return this;
	}
	detachReceiver(agent) {
		agent.removeHook(Agent.Hooks.EFFECT, this.receiver(agent));

		return this;
	}

	/**
	 * Cleanup of the handler (i.e. .removeRouter) must be done manually and as such,
	 * this function returns the handler created.
	 */
	addRouter(trigger, agentEvents = [], ...agents) {
		agentEvents = singleOrArrayArgs(agentEvents);

		const router = (event, result, ...args) => {
			if(agentEvents.includes(event)) {
				this.emit(trigger, ...args);

				if(this.assert(`preventPropagation`)) {
					return true;
				}
			}

			return false;
		};
		for(let agent of agents) {
			agent.addHook(Agent.Hooks.FILTER, router);
		}

		return router;
	}
	addRouterAll(trigger, ...agentEvents) {
		const handler = this.addRouter(trigger, agentEvents, ...this.registry.iterator);

		for(let event of agentEvents) {
			this.config.routers.set(event, [ [ ...this.registry.iterator ], handler ]);
		}

		return this;
	}
	removeRouter(handler, agentEvents = [], ...agents) {
		agentEvents = singleOrArrayArgs(agentEvents);

		for(let agent of agents) {
			agent.removeHook(Agent.Hooks.FILTER, handler);
		}

		return this;
	}
	removeRouterAll(...agentEvents) {
		for(let event of agentEvents) {
			const [ agents, handler ] = this.config.routers.get(event);

			if(Array.isArray(agents)) {
				this.removeRouter(handler, event, ...agents);
				this.config.routers.delete(event);
			}
		}


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

				if(this.assert(`attachReceiver`)) {
					this.attachReceiver(agent);
				}
			}
		}
		
		return this;
	}
	removeAgent(...agents) {
		for(let agent of agents) {
			this.registry.delete(agent.id);
			this.detachReceiver(agent);
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
		
		if(typeof aid === "function") {
			for(let agent of this.registry.iterator) {
				if(aid(agent) === true) {
					results.push(agent.trigger(trigger, ...args));
				}
			}
		} else {
			if(!Array.isArray(aid)) {
				aid = [ aid ];
			}
	
			for(let agent of this.registry.iterator) {
				if(aid.includes(agent.id)) {
					results.push(agent.trigger(trigger, ...args));
				}
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
		
		if(typeof aid === "function") {
			for(let agent of this.registry.iterator) {
				if(aid(agent) === true) {
					results.push(agent.emit(trigger, ...args));
				}
			}
		} else {
			if(!Array.isArray(aid)) {
				aid = [ aid ];
			}
	
			for(let agent of this.registry.iterator) {
				if(aid.includes(agent.id)) {
					results.push(agent.emit(trigger, ...args));
				}
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