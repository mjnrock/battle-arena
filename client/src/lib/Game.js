import Identity from "./Identity";

export class Game extends Identity {
	constructor({ id, tags } = {}) {
		super({ id, tags });
		
		/**
		 * The main registry for all Entities and System used in the game.
		 */
		this.Environment = {};

		/**
		 * The spacetime and material existence of the game, including Player.
		 */
		this.Realm = {};


		this.Render = {};


		this.Config = {};
		// this.config = new Config();


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