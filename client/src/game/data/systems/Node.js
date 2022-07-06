import ASystem from "./ASystem";

export class Node extends ASystem {
	static Events = {
		join: () => {},
		leave: () => {},
		portal: () => {},
	};

	constructor(game, events = [], agent = {}) {
		super(game, events, agent);
	}
};

export default Node;