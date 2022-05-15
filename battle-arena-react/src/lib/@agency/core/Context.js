import { validate } from "uuid";
import Agent from "./Agent";

/**
 * A centralized Agent factory and messaging center.
 */
export class Context extends Agent {
	constructor(agents = [], agentObj = {}) {
		super(agentObj);

		this.hook("get", (target, prop, value) => {
			const entry = target.registry.get(prop);

			if(entry) {
				if(validate(entry)) {
					return target.registry.get(entry);
				}

				return entry;
			}
		});

		this.registry = new Map();
		this.receiver = (...args) => this.receive.call(this, ...args);	// Create concrete reference to function for cleanup on unregistration
		this.assign(...agents);	// Seed Context with an initial group of Agents
	}

	addAgent(agent, ...aliases) {
		this.assign(agent);
		this.addAlias(agent, ...aliases);

		return this;
	}
	removeAgent(agent, ...aliases) {
		this.unassign(agent);
		this.removeAlias(agent, ...aliases);

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
	 * This is a default receiver that can be used directly to act as an "invocation consolidator" or "repeater".
	 * As such, the explicit use of << this.receiver >> is to make << .receive >> overwritable externally, and if necessary, on demand.
	 */
	receive(...args) {
		return this.$route(...args);
	}

	/**
	 * Call << .invoke >> on all Agents in the .registry
	 */
	send(trigger, ...args) {
		for(let agent of this.registry.values()) {
			agent.invoke(trigger, ...args);
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
			agent.addTrigger("$post", this.receiver);
		}


		return this;
	}
	/**
	 * Undo .register
	 */
	unassign(...agents) {
		for(let agent of agents) {
			this.registry.delete(agent.id);
			agent.removeTrigger("$post", this.receiver);
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