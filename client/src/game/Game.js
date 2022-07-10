import Identity from "./lib/Identity";

export class Game extends Identity {
	constructor({ id, tags } = {}) {
		super({ id, tags });

		/**
		 * Invoke all the creation hooks
		 */
		this.pre()
			.init()
			.post();
	}

	pre() {
		return this;
	}
	init() {		
		return this;
	}
	post() {
		return this;
	}
};

export default Game;