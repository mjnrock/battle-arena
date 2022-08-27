import Game from "../Game";
import { System } from "./../lib/ecs/System";
import { Path } from "../lib/pathing/Path";

import Helper from "./../util/helper";

export class World extends System {
	static Alias = "world";

	constructor ({ ...opts } = {}) {
		super(opts);
	}

	join(entities = [], { world, x, y } = {}) {
		System.Each(entities, (entity) => {
			const next = {
				world: world.id,
				x,
				y,
			};

			/**
			 * Add the entity to the world
			 */
			world.entities.add(entity);

			/**
			 * Add the entity into the render context
			 */
			this.env.dispatch("animation:attach", entity, this.game.viewport.getLayer("entity", true));

			entity.world = {
				...entity.world,
				...next,
			};
		});

		return entities;
	}
	leave(entities = [], { world }) {
		System.Each(entities, (entity) => {
			if(entity.world.world === world.id) {
				const next = {
					world: null,
					x: null,
					y: null,
					vx: null,
					vy: null,
				};

				/**
				 * Remove the entity from the world
				 */
				world.entities.remove(entity.id);

				/**
				 * Remove the entity from the render context
				 */
				this.env.dispatch("animation:detach", entity, this.game.viewport.getLayer("entity", true));

				entity.world = {
					...entity.world,
					...next,
				};
			}
		});

		return entities;
	}

	move(entities = [], { x, y, isDelta }) {
		System.Each(entities, (entity) => {
			if(isDelta) {
				entity.world.x += x;
				entity.world.y += y;
			} else {
				entity.world.x = x;
				entity.world.y = y;
			}
		});

		return entities;
	}

	displace(entities = [], { dt }) {
		System.Each(entities, (entity) => {
			let { x, y, vx, vy, facing, speed } = entity.world;

			// Move in 1 direction only, favor Y
			if(vx && vy) {
				vx = 0;
			}

			if(vx || vy) {
				if(vx) {
					if(vx > 0) {
						facing = 0;
					} else if(vx < 0) {
						facing = 180;
					}
				} else if(vy) {
					if(vy > 0) {
						facing = 270;
					} else if(vy < 0) {
						facing = 90;
					}
				}

				x += (vx * dt);
				y += (vy * dt);
			}

			entity.world.x = x;
			entity.world.y = y;
			entity.world.vx = vx;
			entity.world.vy = vy;
			entity.world.facing = facing;
		});

		return entities;
	}
	veloc(entities = [], { vx, vy, isDelta }) {
		System.Each(entities, (entity) => {
			if(isDelta) {
				entity.world.vx += vx;
				entity.world.vy += vy;
			} else {
				entity.world.vx = vx;
				entity.world.vy = vy;
			}
		});

		return entities;
	}

	inputKeyVeloc(entities = [], keyCtrl) {
		const [ player ] = entities;

		const { x, y } = player.world;
		let tx = Helper.round(x, 1),
			ty = Helper.round(y, 1),
			dx = 0,
			dy = 0;

		if(keyCtrl.hasUp) {
			dy = -1;
			dx = 0
		} else if(keyCtrl.hasDown) {
			dy = 1;
			dx = 0
		} else if(keyCtrl.hasLeft) {
			dx = -1;
			dy = 0;
		} else if(keyCtrl.hasRight) {
			dx = 1;
			dy = 0;
		} else {
			player.world.vx = dx = 0;
			player.world.vy = dy = 0;
		}

		if(!player.ai.wayfinder.hasPath || player.ai.wayfinder.current.isDestination(Helper.round(x, 10), Helper.round(y, 10))) {
			const path = Path.FindPath(Game.Get().realm.worlds.current, [ tx, ty ], [ tx + dx, ty + dy ]);

			if(path instanceof Path) {
				player.ai.wayfinder.set(path);
			}
		}
	}
};

export default World;