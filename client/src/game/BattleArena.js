import { Circle } from "./util/shape/Circle";
import { PixelScaleCanvas } from "./util/Base64";
import { Dice } from "./util/Dice";
import { Collection } from "./util/Collection";

import { Pixi, PixiJS } from "./lib/pixi/Pixi";
import { ViewPort } from "./lib/pixi/ViewPort";

import { AssetManager } from "./lib/render/AssetManager";
import { Path } from "./lib/pathing/Path";

import { Squirrel } from "./data/entities/Squirrel";
import { Node } from "./data/entities/realm/Node";
import { World } from "./data/entities/realm/World";
import { Realm } from "./data/entities/realm/Realm";
import { EnumEdgeFlag } from "./data/components/terrain";
import { World as SysWorld } from "./data/systems/World";
import { Animation as SysAnimation } from "./data/systems/Animation";
import { Bunny } from "./data/entities/Bunny";
import { AI as SysAI } from "./data/systems/AI";
import { createViews } from "./data/render/views";
import { loadInputControllers } from "./data/input";

import { Game } from "./Game";

//TODO: @window onblur/onfocus to pause/resume, but also ensure the handlers are removed when the window is blurred and replaced when the window is focused (currently, the handlers break after blur)
//? "WWARNING: Too many active WebGL contexts. Oldest context will be lost." <-- The context-switching may be the reason that handler gets dropped, investigate this

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
	async pre() {
		//TODO: Register / initialize all of the environmental data here
		this.environment.registerFactorySystems([
			//NOTE: Add all of the system classes here
			SysWorld,
			SysAnimation,
			SysAI,
		]);
		this.environment.registerFactoryEntities([
			//NOTE: Add all of the entity classes here
			Squirrel,
			Bunny,
			Node,
			World,
			Realm,
		]);
		this.environment.registerFactoryComponents([]);

		this.config.bootstrap.emit("pre", Date.now());
		this.init();
	},

	/**
	 * Perform the "main" initialization of the game.
	 */
	async init() {
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

		let nudge = 0;
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

		this.renderer.stage.scale.x = this.config.scale;
		this.renderer.stage.scale.y = this.config.scale;

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

		//TODO: Create an EdgeMask evaluator for the World terrain

		/**
		 * Initialize the AssetManager to maintain a registry of assets
		 * and facilitate all of the loading processes.
		 */
		this.assets = new AssetManager();

		/**
		 * Load all of the assets needed for the game
		 */
		await this.assets.loadCanvasSpriteSheet({
			"entity_squirrel": "assets/images/squirrel.png",
			"entity_bunny": "assets/images/bunny.png",
			"entity_bear": "assets/images/bear.png",
			"terrain_water": "assets/images/water.png",
			"terrain_grass": "assets/images/grass.png",
			"terrain_grass_edge": "assets/images/edge-grass.png",
		}, [
			/**
			 * Upsize pixel-scale all of the canvases for better resolution (e.g. 128 -> 4x)
			 */
			({ canvas }) => PixelScaleCanvas(canvas, this.config.tile.width / 32),
		]);

		/**
		 * Create all of the tessellations from the loaded canvases
		 */
		await this.assets.loadTessellations([
			{
				alias: "grass",
				canvas: this.assets.canvases.terrain_grass,
				algorithm: AssetManager.Algorithms.GridBased({ directions: false }),
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
			{
				alias: "grass_edge",
				canvas: this.assets.canvases.terrain_grass_edge,
				algorithm: AssetManager.Algorithms.GridBased({ directions: false }),
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
			{
				alias: "water",
				canvas: this.assets.canvases.terrain_water,
				algorithm: AssetManager.Algorithms.GridBased({ directions: false }),
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
			{
				alias: "squirrel",
				canvas: this.assets.canvases.entity_squirrel,
				algorithm: AssetManager.Algorithms.GridBased({ zones: [ "normal", "moving" ] }),
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
			{
				alias: "bunny",
				canvas: this.assets.canvases.entity_bunny,
				algorithm: AssetManager.Algorithms.GridBased({ zones: [ "normal", "moving" ] }),
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
		]);

		/**
		 * While the position-scores should probably be the dominant usage method, the specific-naming
		 * versions are still 1st class citizens behind the scenes ([ [ "grass.normal.north.0" ], ... ])
		 * and could be similarly generalized with the appropriate naming convention.
		 */
		await this.assets.loadScoresFromArray({
			stationary: [
				[ "0,0" ],
			],
			x4: [
				[ "0,0", "1,0", "2,0", "3,0" ],
			],
			rotate360: [
				[ "0,0", "1,0" ],
				[ "0,1", "1,1" ],
				[ "0,2", "1,2" ],
				[ "0,3", "1,3" ],
			],
		});

		this.config.bootstrap.emit("init", Date.now());
		this.post();
	},

	/**
	 * Perform any post-init tasks, such as rendering and UI.
	 */
	async post() {
		/**
		 ** These constants are extracted here to remind of the contents
		 ** and purpose of the environment.
		 */
		const { system: systems, entity: entities, factory } = this.environment;
		const { system: $S, entity: $E, component: $C } = factory;

		//TODO: Reevaluate the Factory setup -- it feels clunky

		const [ overworld ] = $E.world(1, {
			size: [ 32, 24 ],
			each: ({ alias, node }) => {
				node.alias = alias;
				node.terrain.type = Math.random() > 0.5 ? "grass" : "water";

				/**
				 * Register the Node with the Environment
				 */
				this.environment.entity.register(node);

				let track;
				if(node.terrain.type === "grass") {
					track = this.assets.createTrack("stationary", "grass");
				} else {
					track = this.assets.createTrack("x4", "water");
				}

				node.animation.sprite.texture = track.current;
				node.animation.track = track;

				this.viewport.getLayer("terrain", true).addChild(node.animation.sprite);

				return [
					alias,
					node,
				];
			},
		});

		/**
		 * Get a keyed-node list of neighbors, with enumerator keys for each neighbor, and `false` when no neighbor exists.
		 */
		function getNeighbors(node) {
			const coords = {
				TOP_LEFT: [ node.world.x - 1, node.world.y - 1 ],
				TOP: [ node.world.x, node.world.y - 1 ],
				TOP_RIGHT: [ node.world.x + 1, node.world.y - 1 ],
				LEFT: [ node.world.x - 1, node.world.y ],
				// NONE: [ node.world.x, node.world.y ],
				RIGHT: [ node.world.x + 1, node.world.y ],
				BOTTOM_LEFT: [ node.world.x - 1, node.world.y + 1 ],
				BOTTOM: [ node.world.x, node.world.y + 1 ],
				BOTTOM_RIGHT: [ node.world.x + 1, node.world.y + 1 ],
			};

			let nodes = Object.fromEntries(Object.entries(coords).map(([ alias, [ x, y ] ]) => {
				const node = overworld.nodes[ `${ x },${ y }` ];

				return [ alias, node || false ];
			}));

			return nodes;
		}

		/**
		 * Calculate the edge masks for terrain
		 */
		let types = [ "grass" ];
		for(let x = 0; x < overworld.width; x++) {
			for(let y = 0; y < overworld.height; y++) {
				const node = overworld.nodes[ `${ x },${ y }` ];

				if(!types.includes(node.terrain.type)) {
					const neighbors = getNeighbors(node);

					for(let [ key, neighbor ] of Object.entries(neighbors)) {
						if(neighbor && types.includes(neighbor.terrain.type)) {
							node.terrain.edges |= EnumEdgeFlag[ key ];
						}
					}
				}
			}
		}

		const [ player, ...squirrels ] = $E.squirrel(42, {
			init: {
				world: {
					world: overworld.id,
					model: new Circle({
						x: 0,
						y: 0.2,
						r: 0.25,
					}),
					x: 10,
					y: 10,
					vx: 0.01,
					vy: 0.01,
				},
				status: () => ({
					state: "normal",
				}),
			},
		});
		const [ ...bunnies ] = $E.bunny(14, {
			init: {
				world: {
					world: overworld.id,
					model: new Circle({
						x: 0,
						y: 0,
						r: 0.4,
					}),
					x: 10,
					y: 10,
					vx: 0.01,
					vy: 0.01,
				},
			},
		});

		const [ realm ] = $E.realm(1, {
			worlds: {	// Collection
				items: {
					overworld,
				},
				current: "overworld",
			},
		});

		realm.players = new Collection({
			current: "p1",
			items: {
				p1: player,
			},
		});

		this.realm = realm;

		console.log(this.realm.players.current)

		this.viewport.views.current.subject = this.realm.players.current;

		//FIXME: This needs to exist somewhere as a translation, but not here -- maybe in an EnumDirection?
		let dirLookup = (dir) => {
			switch(dir) {
				case 0:
					return "east";
				case 90:
					return "north";
				case 180:
					return "west";
				case 270:
					return "south";
				default:
					throw new Error(`Invalid direction: ${ dir }`);
			}
		};

		let now = Date.now();
		for(let entity of [ player, ...squirrels, ...bunnies ]) {
			const [ trBunny, trSquirrel ] = this.assets.createSequences(
				[
					{ spritesheet: "bunny", timestep: 500 },
					{ spritesheet: "squirrel", timestep: 500 },
				],
				entity => `${ entity.alias }.${ entity.status.state }.${ dirLookup(entity.world.facing) }`,
			);

			//STUB: Add some randomness to the squirrels' animation cycle "start"
			trSquirrel.timer.config.start = now + (Math.random() < 0.5 ? -1 : 1) * Math.random() * 1000;

			entity.animation.track = entity.alias === "squirrel" ? trSquirrel : trBunny;
			entity.animation.sprite.texture = entity.animation.track.current(entity);

			this.dispatch("world:join", entity, { world: this.realm.worlds.current, x: ~~(Math.random() * this.realm.worlds.current.width), y: ~~(Math.random() * this.realm.worlds.current.height) });

			entity.animation.sprite.anchor.x = 0.5;
			entity.animation.sprite.anchor.y = 0.5;

			//TODO: This sets up an initial Path, but it the Cooldown/NextPath logic is not implemented yet
			//FIXME: Something is happening during the path movement that is causing the Squirrels to hump the ground repeatedly (probably caught in a temporary loop)
			const [ tx, ty ] = [
				Dice.random(0, overworld.width - 1),
				Dice.random(0, overworld.height - 1),
			];
			const path = Path.FindPath(overworld, [ entity.world.x, entity.world.y ], [ tx, ty ]);

			if(path instanceof Path) {
				entity.ai.wayfinder.set(path);
			}
		}

		this.config.bootstrap.emit("post", Date.now());
		this.config.bootstrap.emit("complete", this, Date.now());
	},


	/**
	 * This is the main render loop for the game, called each time the renderer
	 * invokes its requestAnimationFrame facilitator.
	 */
	render({ dt, now } = {}) {
		/**
		 * Process all of the attached listeners to the Entities' game render loop
		 */
		for(let [ uuid, entity ] of this.realm.worlds.current.entities) {
			if(entity.game) {
				entity.game.draw.run({
					dt,
					now,
					game: this,
					subject: entity,
				});
			}
		}

		this.viewport.views.current.render({ dt, now });
	},

	/**
	 * This is the main update loop for the game, called each time the game
	 * performs an update via its main loop.
	 */
	tick({ dt, now } = {}) {
		if(dt > 1) {
			return;
		}

		/**
		 * Process all of the attached listeners to the Entities' game update loop
		 */
		for(let [ uuid, entity ] of this.realm.worlds.current.entities) {
			if(entity.game) {
				entity.game.update.run({
					dt,
					now,
					game: this,
					subject: entity,
				});

				this.dispatch("world:displace", entity, {
					now,
					dt,
				});
			}
		}

		//TODO: Bind a basic mouse controller to the game, click to teleport there

		/**
		 * Adjust velocities and positions from input controllers
		 */
		this.dispatch("world:inputKeyVeloc", this.realm.players.current, this.input.key);

		if(this.input.key.hasShift) {
			this.realm.players.current.ai.wayfinder.empty();
			this.dispatch("world:veloc", this.realm.players.current, {
				vx: 0,
				vy: 0,
			});
		}

		if(this.input.key.hasAlt) {
			this.dispatch("world:move", this.realm.players.current, {
				x: Math.round(this.realm.players.current.world.x),
				y: Math.round(this.realm.players.current.world.y),
			});
		}

		if(this.input.key.hasCtrl || this.input.mouse.hasRight) {
			this.realm.players.current.ai.wayfinder.empty();

			this.dispatch("world:move", this.realm.players.current, {
				x: ~~(this.realm.worlds.current.width / 2),
				y: ~~(this.realm.worlds.current.height / 2),
			});
		}

		if(this.input.mouse.hasLeft) {
			let tx = ~~(this.input.mouse.state.pointer.x / this.renderer.stage.scale.x / this.config.tile.width),
				ty = ~~(this.input.mouse.state.pointer.y / this.renderer.stage.scale.y / this.config.tile.height);

			this.dispatch("world:move", this.realm.players.current, {
				x: tx,
				y: ty,
			});
		}
	}
};

export default function CreateGame({ ...opts } = {}) {
	const game = new Game({
		...opts,

		config: {
			tile: {
				width: 128,
				height: 128,
			},
		},
		hooks: Hooks,
	});

	return game;
};

//#region Extensions
PixiJS.Graphics.prototype.drawRing = function (w, h, cx = 0, cy = 0) {
	var lx = cx - w * 0.5;
	var rx = cx + w * 0.5;
	var ty = cy - h * 0.5;
	var by = cy + h * 0.5;

	var magic = 0.551915024494;
	var xmagic = magic * w * 0.5;
	var ymagic = h * magic * 0.5;

	this.moveTo(cx, ty);
	this.bezierCurveTo(cx + xmagic, ty, rx, cy - ymagic, rx, cy);
	this.bezierCurveTo(rx, cy + ymagic, cx + xmagic, by, cx, by);
	this.bezierCurveTo(cx - xmagic, by, lx, cy + ymagic, lx, cy);
	this.bezierCurveTo(lx, cy - ymagic, cx - xmagic, ty, cx, ty);

	return this;
};
//#endregion Extensions