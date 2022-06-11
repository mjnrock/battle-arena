import Entity from "./@agency/core/ecs/Entity";
import Registry from "./@agency/core/Registry";
import Network from "./@agency/core/relay/Network";

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

		this.Systems = new Registry();

		this.Realm = {};
		// this.realm = new Realm();

		this.Render = {};


		this.Config = {};
		// this.config = new Config();

		this.Data = {};

		this.Mesh = new Network();
	}

	registerSystem(system) {
		this.Systems.add(system);

		return this;
	}
	registerSystems(systems = []) {
		systems = singleOrArrayArgs(systems);

		systems.forEach(system => this.registerSystem(system));

		return this;
	}

	unregisterSystem(system) {
		this.Systems.remove(system);

		return this;
	}
	unregisterSystems(systems = []) {
		systems = singleOrArrayArgs(systems);

		systems.forEach(system => this.unregisterSystem(system));

		return this;
	}
};

export default Game;