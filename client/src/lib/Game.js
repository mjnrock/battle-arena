import Entity from "./@agency/core/ecs/Entity";
import Registry from "./@agency/core/Registry";
import Environment from "./@agency/core/ecs/Environment";

import { createSystemRegistry } from "../data/systems/package";
import { createComponentRegistry } from "../data/components/package";

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

		//TODO Create Archive/Dictionary/Registry for all the generators/classes/instances/etc.

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
		//FIXME	Factory feels like it maybe should be a Component
		this.Factory = {
			Components: createComponentRegistry(this),
			Systems: createSystemRegistry(this),
		};
		this.Environment = new Environment({});

		this.Systems = new Registry();

		const systemEntries = Array.from(this.Factory.Systems.iterator).map(factory => [ factory.name, factory.create() ]);
		systemEntries.forEach(([ name, system ]) => {
			this.Systems.registerWithAlias(system, name);
		});

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