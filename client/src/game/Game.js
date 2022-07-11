import Identity from "./lib/Identity";

import Registry from "./lib/Registry";
import { World } from "./data/entities/realm/World";

export class Game extends Identity {
	constructor({ id, tags } = {}) {
		super({ id, tags });

		this.realm = new Registry({
			overworld: new World({
				size: [ 10, 10 ],
			}),
		});

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