import ASystem from "./ASystem";

export class Position extends ASystem {
	static Events = {
		move: () => {},
	};

	constructor(game, events = [], agent = {}) {
		super(game, events, agent);
	}
};

export default Position;