import { Ticker } from "./util/Ticker";

import { Environment } from "./lib/ecs/Environment";
import { Identity } from "./util/Identity";
import { Registry } from "./util/Registry";
import Eventable from "./util/composable/Eventable";

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
	/** */
	static Get(key = "default") {
		return this.Instances[ key ];
	}
	/**
	 * Extend .Get to grab the ViewPort's *current* View and 
	 * select @layer from it.  This is primarily a convenience
	 * method for animation-related dispatching for layer drawing.
	 * In some sense, this is the "".Get-equivalent" for rendering.
	 */
	static GetViewLayer(layerName, forPixi = false, key = "default") {
		const game = Game.Get(key);
		
		return game.viewport.getLayer(layerName, forPixi);
	}

	/**
	 * @alias is a Multiton-alias for the particular instance being
	 * registered -- if you will only be using one instance of the
	 * game, then you can ignore this parameter entirely.
	 */
	constructor ({ hooks = {}, bootstrap = {}, config = {}, id, tags, alias } = {}) {
		super({ id, tags });

		/**
		 * These hooks should override:
		 * 	- pre
		 * 	- init
		 * 	- post
		 * 	- tick
		 * 	- render
		 */
		for(let [ key, fn ] of Object.entries(hooks)) {
			this[ key ] = fn.bind(this);
		}

		this.config = {
			fps: 24,

			tile: {
				width: 128,
				height: 128,
			},
			scale: 1.0,

			/**
			 * pre, init, post, complete
			 */
			bootstrap: new Eventable({ events: bootstrap }),

			viewport: {
				offset: {
					x: 0,
					y: 0,
				},
			},

			SHOW_DEBUG: true,

			...config,
		};

		/**
		 * Create the default environment for the game, holding
		 * all assets and systems, as the root layer of the game.
		 * All Systems and Entities are stored within this Environment,
		 * as well as their respective factories.
		 */
		this.environment = new Environment();
		this.environment.system.registerClassifiers(
			Registry.Middleware.AttachRef(this, "game"),
		);

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
		 */
		this.assets = {};

		/**
		 * The main loop for the game.
		 * The rendering loop is handled internally by Pixi (add an
		 * observer to the renderer if you want to hook that invocation).
		 */
		this.loop = new Ticker({
			fps: this.config.fps,
		});

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
		 * .pre() invokes .init(), and .init() invokes .post()
		 */
		this.pre();

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

		this.__alias = alias;
	}

	/**
	 * A convenience getter for the game's main environment.
	 */
	get dispatch() {
		return this.environment.dispatch.bind(this.environment);
	}
};

export default Game;