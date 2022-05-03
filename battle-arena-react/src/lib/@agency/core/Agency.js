import Agent from "./Agent";

export class Agency extends Agent {
	constructor(agents = [], agent = {}) {
		super(agent);

		this.agents = agents;
	}
};

export default Agency;