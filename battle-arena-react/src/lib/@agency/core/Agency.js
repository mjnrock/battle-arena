import Agent from "./Agent";

export class Agency extends Agent {
	constructor(agents = [], agent = {}) {
		super(agent);

		this.agents = new Map(agents);
	}

	assign(triggers = [], agents = []) {
		const channelRouterFn = () => {};	//TODO

		if(!Array.isArray(triggers)) {
			triggers = [ triggers ];
		}
		if(!Array.isArray(agents)) {
			agents = [ agents ];
		}

		for(let trigger of triggers) {
			for(let agent of agents) {
				agent.addTrigger(trigger, channelRouterFn);
			}
		}

		return this;
	}

	register(...agent) {
		this.agents.set(agent.id, agent);

		return this;
	}
	unregister(...agent) {
		this.agents.delete(agent.id);

		return this;
	}

	spawn(qty = 1, fnOrObj) {
		const agents = Agent.Factory(qty, fnOrObj, (agent) => {
			this.register(agent);
		});

		return agents;
	}
	despawn(...agents) {
		for(let agent of agents) {
			this.unregister(agent);

			agent.terminate();
		}

		return this;
	}
};

export default Agency;