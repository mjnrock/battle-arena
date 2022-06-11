import Entity from "./@agency/core/ecs/Entity";
import Environment from "./@agency/core/ecs/Environment";

import Realm from "./realm/Realm";
import RealmMap from "./realm/Map";

import { createSystemRegistry } from "../data/systems/package";
import { createComponentRegistry } from "../data/components/package";
import { createEntityRegistry } from "../data/entities/package";

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
		 * The main registry for all Entities and System used in the game.
		 */
		this.Environment = new Environment();

		/**
		 * The spacetime and material existence of the game, including Player.
		 */
		this.Realm = new Realm();
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
			Entities: createEntityRegistry(this),
		};
		
		Array.from(this.Factory.Systems.iterator).forEach(factory => {
			this.Environment.systems.registerWithAlias(factory.create(), factory.name);
		});

		return this;
	}
	init() {
		this.Realm.Maps.registerWithAlias(RealmMap.CreateGrid(10, 10), "overworld");
		
		this.Realm.entities.registry.registerWithAlias(this.Factory.Entities.Squirrel.create(), "player");

		return this;
	}
	post() {
		return this;
	}
};

export default Game;