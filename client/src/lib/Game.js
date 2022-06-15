import Environment from "./@agency/lib/ecs/Environment";

import Components from "../data/components/package";
import Entities from "../data/entities/package";

/**
 * Game is the main class for the game engine, holding all the systems and entities,
 * as well as the render, data, config, mesh communication, and other game-related
 * functions.
 * 
 * The Entity part of the class is for things that will change over time
 * from the System manipulations; the property functions part of the class
 * is for namespace-esque object wrapping with helper functions.
 */
export class Game {
	constructor() {
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
		this.Environment = new Environment({
			generators: {
				Components,
				Entities,
				Systems: {},	// TODO Convert data.Systems to newer paradigm
			},
		});

		return this;
	}
	init() {
		//TODO Create a Realm, Map, Player
		
		return this;
	}
	post() {
		return this;
	}
};

export default Game;