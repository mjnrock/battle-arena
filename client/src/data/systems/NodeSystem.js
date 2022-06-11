import System from "../../lib/@agency/core/ecs/System";

export class NodeSystem extends System {
	constructor(agent = {}) {
		super(agent);

		this.addEventsByObject({
			join: () => {},
			leave: () => {},
			portal: () => {},
		});
	}
};

export default NodeSystem;