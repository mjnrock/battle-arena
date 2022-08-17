import { Pixi, PixiJS } from "./lib/pixi/Pixi";

import { Squirrel } from "./entities/Squirrel";
import { Node } from "./entities/realm/Node";
import { World } from "./entities/realm/World";
import { Realm } from "./entities/realm/Realm";

import { Base64 } from "./util/Base64";
import { Circle } from "./util/shape/Circle";

import { World as SysWorld } from "./systems/World";
import { Animation as SysAnimation } from "./systems/Animation";
import { KeyController } from "./lib/input/KeyController";
import { MouseController } from "./lib/input/MouseController";

import { Game } from "./Game";
import { Perspective } from "./lib/pixi/Perspective";
import { Layer } from "./lib/pixi/Layer";
import { View } from "./lib/pixi/View";
import { ViewPort } from "./lib/pixi/ViewPort";
import { Collection } from "./util/Collection";
import { Registry } from "./lib/Registry";

import { Tessellator } from "./lib/tile/Tessellator";
import { SpriteSheet } from "./lib/tile/pixi/SpriteSheet";
import { Score } from "./lib/tile/animate/Score";
import { Track } from "./lib/tile/animate/Track";

//TODO: @window onblur/onfocus to pause/resume, but also ensure the handlers are removed when the window is blurred and replaced when the window is focused (currently, the handlers break after blur)
//? "WWARNING: Too many active WebGL contexts. Oldest context will be lost." <-- The context-switching may be the reason that handler gets dropped, investigate this

/**
 *? This file is the designated data repository for all of the major game data.
 *? It should perform all of the heavy lifting for the game, and each method will be
 *? bound to the Game for << this >> scoping.
 *
 * Where Game dictates the general flow, BattleArena is the specific data-level implementation.
 * Basically, all game setup is done here.
 */


export async function loadAssets(game) {
	const registry = new Registry();

	//TODO: Load all of the Sprites and Textures here
	return await Base64.DecodeFiles({
		"entity_squirrel": "assets/images/squirrel.png",
		"entity_bunny": "assets/images/bunny.png",
		"entity_bear": "assets/images/bear.png",
	}).then(map => {
		for(let [ alias, canvas ] of Object.entries(map)) {
			registry.registerWithAlias(canvas, alias);
		}

		game.assets = registry;

		return game.assets;
	});
};


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

	/**
	 * Bind all event listeners here
	 */
	//? Intercept events from the input controllers by listening for events
	game.input.key.events.on(KeyController.EventTypes.KEY_PRESS, (e, self) => {
		if(e.code === "KeyC") {
			console.table(game.realm.players.player.world);
		}
	});
	// game.input.mouse.events.on(MouseController.EventTypes.MOUSE_MOVE, (e, self) => console.log(e));

	return game;
};

export function createLayerTerrain(game) {
	return new Layer({
		render: (perspective, ...args) => {
			const gameRef = perspective.ref;
			// const graphics = gameRef.views.current.container;
			const graphics = gameRef.viewport.views.current.container;

			/**
			 * Draw the Terrain
			 */
			for(let [ id, node ] of gameRef.realm.worlds.overworld.nodes) {
				let { x: tx, y: ty } = node.world;
				[ tx, ty ] = [ tx * gameRef.config.tile.width, ty * gameRef.config.tile.height ];

				/**
				 * Use << Perspective.test >> to determine if the node is within the viewport
				 */
				//TODO: This demonstrates the use of Perspective.test, but the results should use the .visible/.renderable properties of the underlying PIXI objects
				if(perspective.test(tx, ty)) {
					//TODO: Load all of the sprites into a registry (terrain.grass, entity.squirrel, etc.)
					//TODO: Use the Terrain sprite to draw the terrain
					let color = 0xFFFFFF;
					if(node.terrain.type === "grass") {
						color = 0x447f52;
					} else if(node.terrain.type === "water") {
						color = 0x436d7c;
					}

					//* Color the grid lines
					graphics.lineStyle(2, 0x000000, 0.1);
					//* Color the terrain grid
					graphics.beginFill(color);
					graphics.drawRect(tx, ty, gameRef.config.tile.width, gameRef.config.tile.height);
					graphics.endFill();
				}
			}
		},
	});
};
export function createLayerEntity(game) {
	return new Layer({
		render: (perspective, ...args) => {
			const gameRef = perspective.ref;
			// const graphics = gameRef.views.current.container;
			const graphics = gameRef.viewport.views.current.container;

			//TODO Draw all of the entities

			/**
			 * Draw the Player
			 */
			const player = gameRef.realm.players.player;
			let { x: tx, y: ty } = player.world;
			[ tx, ty ] = player.world.model.pos(tx, ty);
			[ tx, ty ] = [ tx * gameRef.config.tile.width, ty * gameRef.config.tile.height ];

			if(perspective.test(tx, ty) && player.animation.track) {
				player.animation.sprite.visible = true;
				player.animation.sprite.texture = player.animation.track.current;
				
				player.animation.sprite.x = player.world.x * gameRef.config.tile.width;
				player.animation.sprite.y = player.world.y * gameRef.config.tile.height;
			} else {
				player.animation.sprite.visible = false;
			}
		},
	});
};
export function createViews(game) {
	/**
	 * Create the View collection
	 */
	const collection = new Collection({
		/**
		 * This should map to an existing key in items below
		 */
		current: "gameplay",

		/**
		 * All of the potential Views that could be selected to be used
		 */
		items: {
			gameplay: new View({
				/**
				 * The child Layers
				 */
				layers: {
					terrain: createLayerTerrain(game),
					entity: createLayerEntity(game),
				},

				/**
				 * The Perspective constraint object
				 */
				//TODO: ULtimately, this should flag in/visible to the PIXI object from w/e scope it's in (ViewPort, Layer, etc.)
				perspective: new Perspective({
					ref: game,

					x: game.config.tile.width * 0,
					y: game.config.tile.height * 0,
					width: game.config.tile.width * 25,
					height: game.config.tile.height * 15,
				}),
			}),
		},
	});

	/**
	 * Make all non-current Views invisible
	 */
	for(let [ key, item ] of collection) {
		item.container.visible = key === collection._current;
	}

	return collection;
}

/**
 ** This is the main data consolidator for the game.  It should contain:
 * 	- pre
 * 	- init
 * 	- post
 * 	- tick
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
			SysWorld,
			SysAnimation,
		]);
		this.environment.registerFactoryEntities([
			//STUB: Add all of the entity classes here
			Squirrel,
			Node,
			World,
			Realm,
		]);
		this.environment.registerFactoryComponents([]);

		loadAssets(this).then(assets => {
			// this.init();

			for(let [ uuid, entity ] of this.environment.entity) {
				if(entity.animation) {
					
					//TODO: This is basically a copy and paste -- refactor/reasses these classes and build this out

					const tessellator = Tessellator.FromCanvas({
						alias: "squirrel",
						canvas: assets.entity_squirrel,
						algorithm: Tessellator.Algorithms.GridBased,
						args: [ { tw: 32, th: 32 } ],
					});

					const spritesheet = new SpriteSheet({
						tileset: tessellator.tileset,
					});

					//FIXME: These nested .toObjects do not work properly -- figure out which work and fix the others
					// console.log(spritesheet.toObject());

					const squirrelScore = Score.FromArray([
						[ "squirrel.normal.south.0", "squirrel.normal.south.1" ],
						[ "squirrel.normal.north.0", "squirrel.normal.north.1" ],
						[ "squirrel.normal.west.0", "squirrel.normal.west.1" ],
						[ "squirrel.normal.east.0", "squirrel.normal.east.1" ],
					]);

					const track = Track.Create({
						score: squirrelScore,
						spritesheet,
						autoPlay: true,
					});

					console.log(tessellator);
					console.log(spritesheet);
					console.log(squirrelScore);
					console.log(track);

					entity.animation.sprite.texture = track.current;
					entity.animation.track = track;
				}
			}
		});

		return this.init();
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
			},
			init: {
				world: {
					world: overworld,
					model: new Circle({
						x: 0.5,
						y: 0.5,
						r: 0.5,
					}),
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

		//FIXME: Create a small timeout until everything is completed, otherwise it will error
		setTimeout(() => {
			this.dispatch("world:join", player, { world: overworld, x: 10, y: 10 });
			// console.log(Game.Get().viewport.views.current.layers.get("entity").container);
		}, 100);

		return this.post();
	},

	/**
	 * Perform any post-init tasks, such as rendering and UI.
	 */
	post() {
		/**
		 * Initialize the Pixi wrapper, add Game as a listener (will invoke .render)
		 */
		this.renderer = new Pixi();
		this.renderer.observers.add(this);

		/**
		 * Initialize the ViewPort, Views, and Layers
		 */
		//FIXME: Setup and use the Entity.animation component to determine which/if Sprite should be rendered (load images first from file system)
		console.log(`%c [BATTLE ARENA]: %cWhile the ViewPort appears offset, it is not implemented robustly -- complete the hierarchical associations both at the ECS side and the PIXI side.`, 'background: #ff66a5; padding:5px; color: #fff', 'background: #a363d5; padding:5px; color: #fff');

		let nudge = 320;
		/**
		 * Setup the ViewPort and crop the perspective to (a portion of) the world
		 * 
		 * TODO: Ensure that children are position-offset viz. the parent PIXI object
		 * TODO: Build out the render hierarchy for PIXI objects
		 * TODO: Build a System that un/mounts all children from the Entity.animate component whenever a View is changed
		 */
		this.viewport = new ViewPort({
			ref: this,
			mount: this.renderer.stage,
			views: createViews(this),

			x: 0 + nudge,
			y: 0 + nudge,
			width: this.renderer.stage.width - nudge * 2,
			height: this.renderer.stage.height - nudge * 2,
		});

		/**
		 * Add any additional key / mouse args below.
		 */
		loadInputControllers(this, {
			key: {
				element: window,
			},
			mouse: {
				element: this.renderer.canvas,
			},
		});

		return this;
	},


	/**
	 * This is the main render loop for the game, called each time the renderer
	 * invokes its requestAnimationFrame facilitator.
	 */
	render({ dt } = {}) {
		this.viewport.views.current.render({ dt });
		// this.views.current.render({ dt });c
	},

	/**
	 * This is the main update loop for the game, called each time the game
	 * performs an update via its main loop.
	 */
	tick({ dt, now } = {}) {
		//TODO: Bind a basic mouse controller to the game, click to teleport there
		/**
		 * Adjust velocities and positions from input controllers
		 */
		this.dispatch("world:inputKeyVeloc", this.realm.players.player, this.input.key);

		if(this.input.key.hasShift) {
			this.dispatch("world:veloc", this.realm.players.player, {
				vx: 0,
				vy: 0,
			});
		}

		if(this.input.key.hasCtrl || this.input.mouse.hasRight) {
			this.dispatch("world:move", this.realm.players.player, {
				x: ~~(this.realm.worlds.overworld.width / 2),
				y: ~~(this.realm.worlds.overworld.height / 2),
			});
		}

		if(this.input.mouse.hasLeft) {
			let tx = ~~(this.input.mouse.state.pointer.x / this.config.tile.width),
				ty = ~~(this.input.mouse.state.pointer.y / this.config.tile.height);

			tx -= ~~(this.viewport.perspective.x / this.config.tile.width);
			ty -= ~~(this.viewport.perspective.y / this.config.tile.height);

			this.dispatch("world:move", this.realm.players.player, {
				x: tx,
				y: ty,
			});
		}

		this.dispatch("world:displace", this.realm.players.player, {
			now,
			dt,
		});
	}
};

export default function CreateGame(...opts) {
	return new Game({
		...opts,

		hooks: Hooks,
	});
};