import Identity from "./lib/Identity";

import Registry from "./lib/Registry";
import { World } from "./data/entities/realm/World";

export class Game extends Identity {
	static Instance;

	constructor({ id, tags } = {}) {
		super({ id, tags });

		this.realm = new Registry({
			overworld: new World({
				size: [ 2, 2 ],
			}),
		});

		/**
		 * Invoke all the creation hooks
		 */
		this.pre()
			.init()
			.post();

		if(!Game.Instance) {
			Game.Instance = this;
		}
	}

	static getInstance() {
		if(!Game.Instance) {
			throw new Error(`<< Game.Instance >> is not set.  Either create a new instance first or override this method.`);
			// Game.Instance = new Game();
		}

		return Game.Instance;
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