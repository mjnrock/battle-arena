import { System } from "./../lib/ecs/System";
import Helper from "./../util/helper";
import { Game } from "./../Game";

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
			let mx = Math.sign(vx);
			let my = Math.sign(vy);

			// Move in 1 direction only, favor Y
			if(vx && vy) {
				vx = 0;
			}

			//TODO: Displace the entity in alignment with momentum for tilegrid nudges (requires: CENTER of shape, not TOPLEFT (currently))
			//IDEA: Use the Pathfinding system and the KEY MASK and velocity to move the entity (e.g. RIGHT -> [ 1, 0 ] = Destination while MASK -- on destination, repeat, on MASK end delete destination, 0 velocity)
			//IDEA: Store and use the change in @facing to maintain momemntum (e.g. going DOWN, won't RIGHT until next right is available)
			let margin = 0.05,
				scalar = 20,
				nudge = 0;	// 0 = nudge within tile, 0.5 = nudge to middle of tile

			if(vx) {
				if(vx > 0) {
					facing = 0;
				} else if(vx < 0) {
					facing = 180;
				}

				let div = Helper.floor(y, scalar) % 1;

				if(Helper.near(div, nudge, margin, scalar) || Helper.near(div, -nudge, margin, scalar)) {
					y = ~~y + nudge;
					vy = 0;
				} else {
					vy = -mx * speed;
					vx = 0;
				}
			} else if(vy) {
				if(vy > 0) {
					facing = 270;
				} else if(vy < 0) {
					facing = 90;
				}

				let div = Helper.floor(x, scalar) % 1;

				if(Helper.near(div, nudge, margin, scalar) || Helper.near(div, -nudge, margin, scalar)) {
					x = ~~x + nudge;
					vx = 0;
				} else {
					vx = -my * speed;
					vy = 0;
				}
			}

			x += (vx * dt);
			y += (vy * dt);

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

		const { speed } = player.world;
		if(keyCtrl.hasUp) {
			player.world.vy = -speed;
		} else if(keyCtrl.hasDown) {
			player.world.vy = speed;
		} else {
			player.world.vy = 0;
		}

		if(keyCtrl.hasLeft) {
			player.world.vx = -speed;
		} else if(keyCtrl.hasRight) {
			player.world.vx = speed;
		} else {
			player.world.vx = 0;
		}
	}
};

export default World;