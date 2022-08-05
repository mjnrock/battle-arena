import { Pixi } from "./Pixi";
import { Identity } from "./lib/Identity";
import { Registry } from "./lib/Registry";
import { Environment } from "./lib/ecs/Environment";

import { KeyController } from "./lib/input/KeyController";
import { MouseController } from "./lib/input/MouseController";

import { MainLoop } from "./data/systems/MainLoop";

import { Squirrel } from "./data/entities/Squirrel";
import { Node } from "./data/entities/realm/Node";
import { World } from "./data/entities/realm/World";
import { Realm } from "./data/entities/realm/Realm";

//#region Initialization and Registration
//TODO: Move these to a game config file.
export function registerSystems(environment) {
	/**
	 * * Initialize the Systems here
	 */
	environment.system.registerWithName(new MainLoop());

	/**
	 * * Register the System factories
	 */
	const system = [
		MainLoop,
	].map(s => [ s.Name, s ]);
	environment.factory.system.addMany(Object.fromEntries(system));

	return environment;
};
export function registerEntities(environment) {
	/**
	 * STUB
	 */
	const initializeRealm = () => {
		const overworld = new World({
			size: [ 10, 10 ],
		});
		const realm = new Realm({
			worlds: {
				overworld,
			},
		});

		return realm;
	};
	environment.entity.registerWithAttr(initializeRealm());
	
	/**
	 * * Register the Entity factories
	 */
	const entities = [
		Squirrel,
		Node,
		World,
		Realm,
	].map(e => [ e.Nomen, e ]);
	environment.factory.entity.addMany(Object.fromEntries(entities));

	return environment;
};
export function registerComponents(environment) {
	environment.factory.component.addMany({
		//...TODO
	});

	return environment;
};

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
			Game.Instances.addWithAlias(this, "default");
			Game.Instances.addAlias(this.id, alias);
		} else {
			Game.Instances.addWithAlias(this, alias);
		}
	}

	get realm() {
		/**
		 * TODO: This should remained registered with the environment, but decide whether or not it should be a getter or a facsimile.
		 */
		return this.environment.entity.realm;
	}

	pre() {
		//TODO: Register / initialize all of the environmental data here
		registerSystems(this.environment);
		registerEntities(this.environment);
		registerComponents(this.environment);

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