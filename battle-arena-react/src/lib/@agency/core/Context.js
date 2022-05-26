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
		this.receiver = agent => (effectKey, ...args) => this.$route.call(this, agent, ...args);
		this.assign(...agents);	// Seed Context with an initial group of Agents

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
	 * Overload self for differentiation in handlers
	 */
	invoke(trigger, ...args) {
		return super.invoke(trigger, { id: this.id, state: this.state }, ...args);
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

	/**
	 * Add @agents to the registry and attach the receiver fn as an effect handler
	 */
	assign(...agents) {
		for(let agent of agents) {
			this.registry.set(agent.id, agent);
			agent.addTrigger(agent.config.triggers.effect, this.receiver(agent));
		}


		return this;
	}
	/**
	 * Undo .assign
	 */
	unassign(...agents) {
		for(let agent of agents) {
			this.registry.delete(agent.id);
			agent.removeTrigger(agent.config.triggers.effect, this.receiver(agent));	//TODO This isn't going to unassign correctly
		}


		return this;
	}

	addAgent(agent, ...aliases) {
		this.assign(agent);
		this.addAlias(agent, ...aliases);

		return this;
	}
	removeAgent(agent) {
		this.unassign(agent);
		for(let [ key, value ] of Object.entries(this.registry)) {
			if(key === agent.id || value === agent.id) {	// Remove id and aliases
				this.registry.delete(key);
			}
		}

		return this;
	}

	_makeAlias(agent) {}
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
			this.assign(agent);
		});

		return agents;
	}
	/**
	 * Undo .spawn and terminate the Agent
	 */
	despawn(...agents) {
		for(let agent of agents) {
			this.unassign(agent);

			agent.terminate();
		}

		return this;
	}
};

export default Context;