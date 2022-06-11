import Entity from "./@agency/core/ecs/Entity";
import Registry from "./@agency/core/Registry";

import { loadSystemsRegistry } from "../data/systems/package";

/**
 * Game is the main class for the game engine, holding all the systems and entities,
 * as well as the render, data, config, mesh communication, and other game-related
 * functions.
 * 
 * The Entity part of the class is for things that will change over time
 * from the System manipulations; the property functions part of the class
 * is for namespace-esque object wrapping with helper functions.
 */
export class Game extends Entity {
	constructor() {
		super();

		/**
		 * The main Registry for all systems within the Game.
		 */
		this.Systems = new Registry();

		/**
		 * The spacetime and material existence of the game, including Player.
		 */
		this.Realm = {};
		// this.realm = new Realm();

		this.Render = {};


		this.Config = {};
		// this.config = new Config();


		this.pre();
		this.init();
		this.post();
	}

	pre() {
		loadSystemsRegistry(this);

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