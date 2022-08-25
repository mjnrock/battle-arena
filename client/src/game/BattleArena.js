import { Pixi, PixiJS } from "./lib/pixi/Pixi";

import { Squirrel } from "./entities/Squirrel";
import { Node } from "./entities/realm/Node";
import { World } from "./entities/realm/World";
import { Realm } from "./entities/realm/Realm";
import { Circle } from "./util/shape/Circle";

import { Bitwise } from "./util/Bitwise";
import { EnumEdgeFlag } from "./components/terrain";

import { World as SysWorld } from "./systems/World";
import { Animation as SysAnimation } from "./systems/Animation";
import { AI as SysAI } from "./systems/AI";
import { KeyController } from "./lib/input/KeyController";
import { MouseController } from "./lib/input/MouseController";

import { Game } from "./Game";
import { Perspective } from "./lib/pixi/Perspective";
import { Layer } from "./lib/pixi/Layer";
import { View } from "./lib/pixi/View";
import { ViewPort } from "./lib/pixi/ViewPort";
import { Collection } from "./util/Collection";

import { AssetManager } from "./lib/render/AssetManager";
import { PixelScaleCanvas } from "./util/Base64";
import { Path } from "./lib/pathing/Path";
import { Dice } from "./util/Dice";
import Helper from "./util/helper";

//TODO: @window onblur/onfocus to pause/resume, but also ensure the handlers are removed when the window is blurred and replaced when the window is focused (currently, the handlers break after blur)
//? "WWARNING: Too many active WebGL contexts. Oldest context will be lost." <-- The context-switching may be the reason that handler gets dropped, investigate this

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
			console.log(game.realm.players.current);
		} else if(e.code === "F3") {
			game.config.SHOW_DEBUG = !game.config.SHOW_DEBUG;

			//STUB: This needs to be formalized -- when Debug toggles off, the debug layers should be hidden
			for(let [ uuid, entity ] of game.realm.worlds.current.entities) {
				entity.animation.debug.visible = game.config.SHOW_DEBUG;
			}
		}
	});
	// game.input.mouse.events.on(MouseController.EventTypes.MOUSE_MOVE, (e, self) => console.log(e));

	return game;
};

export function createLayerTerrain(game) {
	function drawEdgeMask(graphics, node) {
		/**
		 * Future proofs against resolution scaling
		 */
		let factor = game.config.tile.width / 32;
		let passes = [
			[ factor * 3, factor * 3 ],
			[ factor * 5, factor * 5 ],
			[ factor * 7, factor * 7 ],
		];

		/**
		 * Iterate each of the shading passes, drawing the relevant edges
		 */
		let i = 0;
		for(let [ w, h ] of passes) {
			let [ tw, th ] = [ game.config.tile.width, game.config.tile.height ];

			//* Begin the N, S, E, W edges
			graphics.beginFill(0x000000, 0.1 / (i + 1));
			// graphics.beginFill(0xFF0000, 0.5 / (i + 1));

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.LEFT)) {
				graphics.drawRect(node.world.x * tw - w / 2, node.world.y * th, w, th);
			}

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.RIGHT)) {
				graphics.drawRect(node.world.x * tw + tw - w + w / 2, node.world.y * th, w, th);
			}

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.TOP)) {
				graphics.drawRect(node.world.x * tw, node.world.y * th - h / 2, tw, h);
			}

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.BOTTOM)) {
				graphics.drawRect(node.world.x * tw, node.world.y * th + th - h + h / 2, tw, h);
			}

			graphics.endFill();

			//* Begin the NW, NE, SE, SW edges
			// graphics.beginFill(0x0000FF, 0.5);

			// let radius = 10;
			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.TOP_LEFT)) {
			// 	graphics.drawRect(node.world.x * tw, node.world.y * th, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + radius, node.world.y * th + radius, radius);
			// }

			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.TOP_RIGHT)) {
			// 	graphics.drawRect(node.world.x * tw + tw - radius, node.world.y * th, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + tw - radius, node.world.y * th + radius, radius);
			// }

			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.BOTTOM_LEFT)) {
			// 	graphics.drawRect(node.world.x * tw, node.world.y * th + th - radius, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + radius, node.world.y * th + th - radius, radius);
			// }

			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.BOTTOM_RIGHT)) {
			// 	graphics.drawRect(node.world.x * tw + tw - radius, node.world.y * th + th - radius, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + tw - radius, node.world.y * th + th - radius, radius);
			// }

			// graphics.endFill();

			++i;
		}
	}

	const layer = new Layer({
		render: (perspective, { dt, now }) => {
			/**
			 * Clear the overlay graphics, if any
			 */
			layer.overlay.clear();

			/**
			 * Draw the Terrain
			 */
			for(let [ id, node ] of game.realm.worlds.current.nodes) {
				let { x: tx, y: ty } = node.world;
				[ tx, ty ] = [ tx * game.config.tile.width, ty * game.config.tile.height ];

				if(perspective.test(tx, ty) && node.animation.track) {
					node.animation.sprite.visible = true;

					node.animation.track.next(now);
					node.animation.sprite.texture = node.animation.track.current;

					node.animation.sprite.x = node.world.x * game.config.tile.width;
					node.animation.sprite.y = node.world.y * game.config.tile.height;

					drawEdgeMask(layer.overlay, node);
				} else {
					node.animation.sprite.visible = false;
				}
			}
		},
	});

	return layer;
};

export function createLayerEntity(game) {
	const layer = new Layer({
		render: (perspective, { dt, now }) => {
			/**
			 * Clear the overlay graphics, if any
			 */
			layer.overlay.clear();

			console.log(game.viewport.views.current.subject.world.x, game.viewport.views.current.subject.world.y);
			console.log(game.viewport.views.current.perspective.x, game.viewport.views.current.perspective.y);

			/**
			 * Draw the Entities
			 */
			for(let [ uuid, entity ] of game.realm.worlds.current.entities) {
				let { x: tx, y: ty } = entity.world;
				[ tx, ty ] = entity.world.model.pos(tx, ty);
				[ tx, ty ] = [ tx * game.config.tile.width, ty * game.config.tile.height ];

				//FIXME: Perspective HEIGHT/WIDTH does not seem to be correct (w/h may not take into account the tw/th normalization?)
				if(perspective.test(tx, ty) && entity.animation.track) {
					entity.animation.sprite.visible = true;

					entity.animation.track.next(now);
					entity.animation.sprite.texture = entity.animation.track.current;

					entity.animation.sprite.x = entity.world.x * game.config.tile.width + (game.config.tile.width * 0.5);
					entity.animation.sprite.y = entity.world.y * game.config.tile.height + (game.config.tile.height * 0.5);
				} else {
					entity.animation.sprite.visible = false;
				}
			}
		},
	});

	return layer;
};

export function createLayerDebug(game) {
	const layer = new Layer({
		render: (perspective, { dt, now }) => {
			if(!game.config.SHOW_DEBUG) {
				return;
			}
			/**
			 * Clear the overlay graphics, if any
			 */
			layer.overlay.clear();

			//FIXME: I don't like the idea of attaching the debug graphics to the entity like this (see F3 press code)

			/**
			 * Draw the Entities
			 */
			for(let [ uuid, entity ] of game.realm.worlds.current.entities) {
				let { x: tx, y: ty } = entity.world;
				[ tx, ty ] = entity.world.model.pos(tx, ty);
				[ tx, ty ] = [ tx * game.config.tile.width, ty * game.config.tile.height ];

				if(!entity.animation.debug) {
					entity.animation.debug = new PixiJS.Graphics();

					const text = new PixiJS.Text(uuid, new PixiJS.TextStyle({
						fontFamily: "monospace",
						fill: [ "#ffffff" ],
						align: "center",
						fontSize: 16,
					}));

					text.x += game.config.tile.width / 2;
					text.y -= game.config.tile.height / 2;

					entity.animation.debug.addChild(text);

					entity.animation.sprite.addChild(entity.animation.debug);
				} else {
					entity.animation.debug.visible = false;
				}

				//FIXME: Perspective HEIGHT/WIDTH does not seem to be correct (w/h may not take into account the tw/th normalization?)
				if(perspective.test(tx, ty)) {
					entity.animation.debug.visible = true;

					// entity.animation.debug.beginFill(0x000000);
					// entity.animation.debug.drawRect(game.config.tile.width / 2, -game.config.tile.height / 2, game.config.tile.width * 2/3, game.config.tile.height);
					// entity.animation.debug.endFill();

					const [ text ] = entity.animation.debug.children;
					text.text = "";
					text.text += "\r\n" + `${ entity.world.facing }°`
					text.text += "\r\n" + `[${ Helper.round(entity.world.x, 10).toFixed(1) } ${ Helper.round(entity.world.y, 10).toFixed(1) }]`;
					text.text += "\r\n" + `(${ Helper.round(entity.world.vx, 10).toFixed(1) } ${ Helper.round(entity.world.vy, 10).toFixed(1) })`;
					let [ x_dest, y_dest ] = [
						~~((entity.ai.wayfinder.current || {}).destination || [])[ 0 ] || null,
						~~((entity.ai.wayfinder.current || {}).destination || [])[ 1 ] || null,
					];
					text.text += "\r\n" + (x_dest ? `{${ x_dest } ${ y_dest }}` : "");

				}
			}
		},
	});

	return layer;
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
					debug: createLayerDebug(game),
				},

				/**
				 * The Perspective constraint object
				 */
				//TODO: ULtimately, this should flag in/visible to the PIXI object from w/e scope it's in (ViewPort, Layer, etc.)
				//FIXME: ViewPorts should be a Grid where Views occupy x,y,w,h positions
				//TODO: Create a Grid class that keeps track of a Grid and its children with relative grid positions
				perspective: new Perspective({
					ref: game,

					x: game.config.tile.width * -1,
					y: game.config.tile.height * -1,
					width: window.innerWidth + (game.config.tile.width * 2),
					height: window.innerHeight + (game.config.tile.height * 2),
				}),
			}),
		},
	});


	/**
	 * Make all non-current Views invisible
	 */
	for(let [ key, item ] of collection) {
		item.container.visible = item === collection.current;
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
				algorithm: AssetManager.Algorithms.GridBased,
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
			{
				alias: "grass_edge",
				canvas: this.assets.canvases.terrain_grass_edge,
				algorithm: AssetManager.Algorithms.GridBased,
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
			{
				alias: "water",
				canvas: this.assets.canvases.terrain_water,
				algorithm: AssetManager.Algorithms.GridBased,
				args: [ { tw: this.config.tile.width, th: this.config.tile.height } ],
			},
			{
				alias: "squirrel",
				canvas: this.assets.canvases.entity_squirrel,
				algorithm: AssetManager.Algorithms.GridBased,
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

				//NOTE: Because this checks the neighbors bidirectionally, any action will be performed **twice**
				// As such, if you use this, either maintain a "analyzed nodes" list (currently STUB w/ half the application values)
				// const neighbors = getNeighbors(node);
				// for(let [ key, neighbor ] of Object.entries(neighbors)) {
				// 	if(neighbor && neighbor.terrain.type !== node.terrain.type) {
				// 		node.terrain.edges |= EnumEdgeFlag[ key ];
				// 	}
				// }

				//? Alternative approach:
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

		const [ player, ...rest ] = $E.squirrel(100, {
			init: {
				world: {
					world: overworld.id,
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

		this.viewport.views.current.subject = this.realm.players.current;

		let now = Date.now();
		for(let entity of [ player, ...rest ]) {
			const track = this.assets.createTrack("rotate360", "squirrel");

			//STUB: Add some randomness to the squirrels' animation cycle "start"
			track.timer.config.start = now + (Math.random() < 0.5 ? -1 : 1) * Math.random() * 1000;

			entity.animation.track = track;
			entity.animation.sprite.texture = track.current;

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
			this.dispatch("world:veloc", this.realm.players.current, {
				vx: 0,
				vy: 0,
			});
		}

		if(this.input.key.hasCtrl || this.input.mouse.hasRight) {
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