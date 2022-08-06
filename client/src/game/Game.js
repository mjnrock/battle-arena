import { Pixi } from "./lib/pixi/Pixi";
import { Identity } from "./lib/Identity";
import { Registry } from "./lib/Registry";
import { Environment } from "./lib/ecs/Environment";

import { KeyController } from "./lib/input/KeyController";
import { MouseController } from "./lib/input/MouseController";

import { Squirrel } from "./entities/Squirrel";
import { Node } from "./entities/realm/Node";
import { World } from "./entities/realm/World";
import { Realm } from "./entities/realm/Realm";

export function loadInputControllers(game, { mouse, key } = {}) {
	game.input = {
		key: new KeyController(key),
		mouse: new MouseController(mouse),
	};

	return game;
};
//#endregion Initialization and Registration


export class Game extends Identity {
	/**
	 * Treat the Game class largely as a de-facto Singleton,
	 * but with the added benefit of being able to store multiple
	 * instances of a Game (e.g. for parallelization).
	 */
	static Instances = new Registry();

	/**
	 * Create a standard getter, using a Singleton pattern as
	 * the default return value.
	 */
	static Get(key = "default") {
		return this.Instances[ key ];
	}

	/**
	 * @alias is a Multiton-alias for the particular instance being
	 * registered -- if you will only be using one instance of the
	 * game, then you can ignore this parameter entirely.
	 */
	constructor ({ id, tags, alias } = {}) {
		super({ id, tags });

		/**
		 * This controls the timing of updates and renders
		 */
		// this.loop = new MainLoop();

		/**
		 * Create the default environment for the game, holding
		 * all assets and systems, as the root layer of the game.
		 * All Systems and Entities are stored within this Environment,
		 * as well as their respective factories.
		 */
		this.environment = new Environment();

		/**
		 * STUB: This is initialized in .post()
		 * All of the rendering aspects of the game are stored here.
		 */
		this.render = {};

		/**
		 * STUB: This is initialized in .init()
		 */
		this.realm = {};

		/**
		 * STUB: This is initialized in .post()
		 * The HID/input controllers for the game.
		 */
		this.input = {
			key: null,
			mouse: null,
		};

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
			Game.Instances.registerWithAlias(this, "default");

			if(alias) {
				Game.Instances.registerAlias(this.id, alias);
			}
		} else {
			Game.Instances.registerWithAlias(this, alias);
		}
	}

	pre() {
		//TODO: Register / initialize all of the environmental data here
		this.environment.registerFactorySystems([
			//STUB: Add all of the system classes here
		]);
		this.environment.registerFactoryEntities([
			//STUB: Add all of the entity classes here
			Squirrel,
			Node,
			World,
			Realm,
		]);
		this.environment.registerFactoryComponents([]);

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
		//TODO: Make a general "game realm initialization" function
		const [ overworld ] = $E.world(1, {
			size: [ 10, 10 ],
		});

		//* Create the main realm
		const [ realm ] = $E.realm(1, {
			worlds: {
				overworld,
			},
		});
		this.realm = realm;

		return this;
	}
	post() {
		/**
		 * Initialize the Pixi wrapper
		 */
		this.render = new Pixi();

		//TODO: Bootstrap all of the rendering, input, etc. aspects / data of the game

		/**
		 * Add any additional key / mouse args below.
		 */
		//FIXME: Commented out temporarily until these are more production-ready (cf. F5/F12 notes)
		// loadInputControllers(this.environment, {
		// 	key: {
		// 		element: window,
		// 	},
		// 	mouse: {
		// 		element: this.render.canvas,
		// 	},
		// });

		return this;
	}

	/**
	 * A convenience getter for the game's main environment.
	 */
	get dispatch() {
		return this.environment.dispatch;
	}
};

export default Game;