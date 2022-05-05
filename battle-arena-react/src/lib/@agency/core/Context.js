import Agent from "./Agent";

/**
 * A centralized Agent factory and messaging center.
 */
export class Context extends Agent {
	constructor(agents = [], agentObj = {}) {
		super(agentObj);

		this.registry = new Map();
		this.receiver = (...args) => this.receive.call(this, ...args);	// Create concrete reference to function for cleanup on unregistration
		this.register(...agents);	// Seed Context with an initial group of Agents
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
	register(...agents) {
		for(let agent of agents) {
			this.registry.set(agent.id, agent);
			agent.addTrigger("$post", this.receiver);
		}


		return this;
	}
	/**
	 * Undo .register
	 */
	unregister(...agents) {
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
			this.register(agent);
		});

		return agents;
	}
	/**
	 * Undo .spawn and terminate the Agent
	 */
	despawn(...agents) {
		for(let agent of agents) {
			this.unregister(agent);

			agent.terminate();
		}

		return this;
	}
};

export default Context;