import { Pixi } from "./Pixi";
import { Identity } from "./lib/Identity";
import { Registry } from "./lib/Registry";
import { Environment } from "./lib/ecs/Environment";

import { KeyController } from "./lib/input/KeyController";
import { MouseController } from "./lib/input/MouseController";


export class Game extends Identity {
	static Instances = new Registry();

	static Get(key = "default") {
		return this.Instances[ key ];
	}

	constructor ({ id, tags, alias } = {}) {
		super({ id, tags });

		/**
		 * Create the default environment for the game, holding
		 * all assets and systems, as the root layer of the game.
		 * All Systems and Entities are stored within this Environment,
		 * as well as their respective factories.
		 */
		this.environment = new Environment();

		/**
		 * ! This is initialized in .post()
		 * All of the rendering aspects of the game are stored here.
		 */
		this.render = {};

		/**
		 * Invoke all the creation hooks
		 */
		this.pre()
			.init()
			.post();

		/**
		 * Create a default Game instance, if one does not exist,
		 * otherwise just add this instance to the registry.
		 * Optionally, @alias can be passed during instantiation
		 * to add an/another instance-alias.
		 */
		if(!Game.Get()) {
			Game.Instances.addWithAlias(this, "default");
			Game.Instances.addAlias(this.id, alias);
		} else {
			Game.Instances.addWithAlias(this, alias);
		}
	}

	pre() {
		//TODO: Register / initialize all of the environmental data here

		return this;
	}
	init() {
		/**
		 ** These constants are extracted here to remind of the contents
		 ** and purpose of the environment.
		 */
		const { system: systems, entity: entities, factory } = this.environment;
		const { system: $S, entity: $E, component: $C } = factory;

		//TODO: Initialize all of the game data, create worlds, etc.

		return this;
	}
	post() {
		this.render = new Pixi();

		//TODO: Bootstrap all of the rendering aspects / data of the game

		return this;
	}

	get dispatch() {
		return this.environment.dispatch;
	}
};

export default Game;