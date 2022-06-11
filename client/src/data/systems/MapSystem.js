import ASystem from "./ASystem";

export class MapSystem extends ASystem {
	static Events = {
		collision: (state, entities, ...args) => {
			console.log(entities);
			console.log(...args);
		},
		join: () => {},
		leave: () => {},
	};

	constructor(game, events = {}, agent = {}) {
		super(game, events, agent);
	}
};

export default MapSystem;