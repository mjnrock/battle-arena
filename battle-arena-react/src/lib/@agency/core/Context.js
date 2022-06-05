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

		/**
		 * The registry of Agents that are registered to this Context.
		 */
		this.registry = new Registry();

		/**
		 * Override the Registry default encoder to maintain that only Agents
		 * be added to the .registry
		 */
		this.registry.encoder = function(id, entry, type = RegistryEntry.Type.VALUE) {
			if(entry instanceof Agent) {
				this.registry.set(id, new RegistryEntry(id, entry, type));

				return true;
			}

			return false;
		};

		this.mergeConfig({
			/**
			 * This dictates whether or not the Context will prevent propagation
			 * of an Agent event when captured by a Router.
			 */
			preventPropagation: false,

			/**
			 * This is a map of event names to [ [agents], handler ] pairs for routers,
			 * to facilitate cleanup of handlers ex-post.
			 * 
			 * NOTE that while the Agents may change over time, this maintains a record
			 * of the attached Agents, and thus has implications for garbage collection.
			 */
			routers: new Map(),
		}, true);

		//?	Verify that you can un/register this function as expected, or if this creates a variable reference
		this.registerAgent(...agents);
	}
	
	//#region Agent Membership
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
	
	registerAgent(...agents) {
		for(let agent of agents) {
			if(agent instanceof Agent) {
				this.registry.set(agent.id, agent);
			}
		}
		
		return this;
	}
	unregisterAgent(...agents) {
		for(let agent of agents) {
			this.registry.delete(agent.id);
		}

		return this;
	}
	//#endregion Agent Membership
	
	//#region Agent Events
	static Receiver = (ctx, agent) => (trigger, payload) => ctx.hook(Context.Hooks.RECEIVE, trigger, [ agent, payload ]);
	attachReceiver(agent) {
		const handler = Context.Receiver(this, agent);

		agent.addHook(Agent.Hooks.EFFECT, handler);

		return handler;
	}      
	detachReceiver(handler, agent) {
		agent.removeHook(Agent.Hooks.EFFECT, handler);

		return this;
	}

	/**
	 * Cleanup of the handler (i.e. .removeRouter) must be done manually and as such,
	 * this function returns the handler created.
	 * 
	 * NOTE that while this can prevent further propagation of the event, it does not prevent any
	 * processing that happened in handlers before this handler in the stack.  As such, if you want
	 * to ensure that it is the first handler in the stack, you must clear the Agent's stack before
	 * adding this handler, and potentially maintain a record of changes.
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
	removeRouter(handler, agentEvents = [], ...agents) {
		agentEvents = singleOrArrayArgs(agentEvents);

		for(let agent of agents) {
			agent.removeHook(Agent.Hooks.FILTER, handler);
		}

		return this;
	}

	/**
	 * This is the .addRouter equivalent for the Context, automatically selecting all registered Agents.
	 * 
	 * NOTE that all the same caveats apply to this function as the .addRouter function.
	 */
	addRouterAll(trigger, ...agentEvents) {
		const handler = this.addRouter(trigger, agentEvents, ...this.registry.iterator);

		for(let event of agentEvents) {
			this.config.routers.set(event, [ [ ...this.registry.iterator ], handler ]);
		}

		return this;
	}
	/**
	 * This is the .removeAgent equivalent for the Context, automatically selecting all registered Agents.
	 * 
	 * NOTE that all the same caveats apply to this function as the .removeAgent function.
	 */
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