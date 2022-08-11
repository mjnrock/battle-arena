import { Pixi } from "./lib/pixi/Pixi";

import { Squirrel } from "./entities/Squirrel";
import { Node } from "./entities/realm/Node";
import { World } from "./entities/realm/World";
import { Realm } from "./entities/realm/Realm";

import { World as WorldController } from "./controllers/World";
import { KeyController } from "./lib/input/KeyController";
import { MouseController } from "./lib/input/MouseController";

import { Game } from "./Game";

/**
 *? This file is the designated data repository for all of the major game data.
 *? It should perform all of the heavy lifting for the game, and each method will be
 *? bound to the Game for << this >> scoping.
 *
 * Where Game dictates the general flow, BattleArena is the specific data-level implementation.
 * Basically, all game setup is done here.
 */


/**
 ** This is the main input trap for the game.  It should contain:
 * 	- key
 * 	- mouse
 */
export function loadInputControllers(game, { mouse, key } = {}) {
	game.input = {
		key: new KeyController(key),
		mouse: new MouseController(mouse),
	};

	return game;
};

/**
 ** This is the main data consolidator for the game.  It should contain:
 * 	- pre
 * 	- init
 * 	- post
 * 	- update
 * 	- render
 */
export const Hooks = {
	/**
	 * Perform any initialization tasks for the game, such as registering
	 * all of the system and entity factories.
	 */
	pre() {
		//TODO: Register / initialize all of the environmental data here
		this.environment.registerFactorySystems([
			//STUB: Add all of the system classes here
			WorldController,
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
	},
	/**
	 * Perform the "main" initialization of the game.
	 */
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
			size: [ 32, 24 ],
			each: ({ alias, node }) => {
				node.terrain.type = Math.random() > 0.5 ? "grass" : "water";

				return [
					alias,
					node,
				];
			},
		});

		//* Create the main realm
		const [ realm ] = $E.realm(1, {
			worlds: {
				overworld,
			},
		});
		this.realm = realm;

		const [ player ] = $E.squirrel(1, {
			components: {
				world: {
					id: overworld.id,
				},
			},
			init: {
				position: {
					x: 10,
					y: 10,
					vx: 0.01,
					vy: 0.01,
				},
			},
		});

		realm.players = {
			player,
		};

		return this;
	},
	/**
	 * Perform any post-init tasks, such as rendering and UI.
	 */
	post() {
		/**
		 * Initialize the Pixi wrapper
		 */
		this.renderer = new Pixi();
		this.renderer.observers.add(this);

		/**
		 * Add any additional key / mouse args below.
		 */
		//FIXME: Commented out temporarily until these are more production-ready (cf. F5/F12 notes)
		loadInputControllers(this, {
			key: {
				element: window,
			},
			mouse: {
				element: this.render.canvas,
			},
		});

		return this;
	},

	/**
	 * This is the main render loop for the game, called each time the renderer
	 * invokes its requestAnimationFrame facilitator.
	 */
	render() {
		if(!this.realm) {
			return;
		}

		/**
		 * Draw the Terrain
		 */
		for(let [ id, node ] of this.realm.worlds.overworld.nodes) {
			const graphics = this.renderer.graphics;
			const { x, y } = node.position;

			let color = 0xFFFFFF;
			if(node.terrain.type === "grass") {
				color = 0x447f52;
			} else if(node.terrain.type === "water") {
				color = 0x436d7c;
			}

			graphics.lineStyle(2, 0x000000, 1);
			graphics.beginFill(color);
			graphics.drawRect(x * this.config.tile.width, y * this.config.tile.height, this.config.tile.width, this.config.tile.height);
			graphics.endFill();
		}

		/**
		 * Draw the Player
		 */
		const graphics = this.renderer.graphics;

		//STUB: .tick should be called by the game loop
		//FIXME: Perform the similar listening for "tick" that this.renderer and this does
		//TODO: Implement the game loop
		this.tick();

		const { x, y } = this.realm.players.player.position;

		graphics.lineStyle(2, 0x000000, 1);
		graphics.beginFill(0xFF0000, 1);
		graphics.drawRect(x * this.config.tile.width, y * this.config.tile.height, this.config.tile.width, this.config.tile.height);
		graphics.endFill();
	},

	/**
	 * This is the main update loop for the game, called each time the game
	 * performs an update via its main loop.
	 */
	tick() {
		//TODO: Bind a basic mouse controller to the game, click to teleport there
		/**
		 * Adjust velocities and positions from input controllers
		 */
		this.dispatch("world:inputKeyVeloc", this.realm.players.player, {
			inputKey: this.input.key,
		});

		if(this.input.key.hasShift) {
			this.dispatch("world:veloc", this.realm.players.player, {
				vx: 0,
				vy: 0
			});
		}

		if(this.input.key.hasCtrl) {
			this.dispatch("world:move", this.realm.players.player, {
				x: ~~(this.realm.worlds.overworld.width / 2),
				y: ~~(this.realm.worlds.overworld.height / 2)
			});
		}

		this.dispatch("world:move", this.realm.players.player, {
			x: this.realm.players.player.position.vx,
			y: this.realm.players.player.position.vy,
			isDelta: true,
		});
	}
};

export default function CreateGame(...opts) {
	return new Game({
		...opts,

		hooks: Hooks,
	});
};