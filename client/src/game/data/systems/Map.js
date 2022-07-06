import ASystem from "./ASystem";

export class Map extends ASystem {
	static Events = {
		collision: (state, entities, ...args) => {
			console.log(entities);
			console.log(...args);
		},
		join: () => {},
		leave: () => {},
	};

	constructor(game, events = [], agent = {}) {
		super(game, events, agent);
	}
};

export default Map;