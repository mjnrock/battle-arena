import ASystem from "./ASystem";

export class Terrain extends ASystem {
	static Events = {
		assign: () => {},
	};

	constructor(game, events = {}, agent = {}) {
		super(game, events, agent);
	}
};

export default Terrain;