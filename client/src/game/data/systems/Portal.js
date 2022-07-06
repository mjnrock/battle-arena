import ASystem from "./ASystem";

export class Portal extends ASystem {
	static Events = {
		attempt: () => {},
		activate: () => {},
	};

	constructor(game, events = [], agent = {}) {
		super(game, events, agent);
	}
};

export default Portal;