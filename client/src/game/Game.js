import { Identity } from "./lib/Identity";
import { Registry } from "./lib/Registry";
import { Environment } from "./lib/ecs/Environment";

/**
 * This is the root Game object.  It should be hooked by an external
 * data source to fill in all of the methods that it invokes (cf. BattleArena.js).
 */
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
	constructor ({ hooks = {}, config = {}, id, tags, alias } = {}) {
		super({ id, tags });

		/**
		 * These hooks should override:
		 * 	- pre
		 * 	- init
		 * 	- post
		 * 	- update
		 * 	- render
		 */
		for(let [ key, fn ] of Object.entries(hooks)) {
			this[ key ] = fn.bind(this);
		}

		/**
		 * This controls the timing of updates and renders
		 */
		// this.loop = new MainLoop();

		this.config = {
			tile: {
				width: 32,
				height: 32,
			},

			...config,
		};

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
		this.renderer = {};

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

	/**
	 * A convenience getter for the game's main environment.
	 */
	get dispatch() {
		return this.environment.dispatch;
	}
};

export default Game;