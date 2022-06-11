import System from "../../lib/@agency/core/ecs/System";

export class MapSystem extends System {
	constructor(agent = {}) {
		super(agent);

		this.addEventsByObject({
			collision: (state, entities, ...args) => {
				console.log(entities);
				console.log(...args);
			},
			join: () => {},
			leave: () => {},
		});
	}
};

export default MapSystem;