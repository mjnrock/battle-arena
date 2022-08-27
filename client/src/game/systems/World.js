import { System } from "./../lib/ecs/System";

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
			let { x, y, vx, vy, mx, my, facing, speed } = entity.world;

			/**
			 * IDEA: GENERAL FLOW
			 * 1. Use "momentum" to cache displacement remainders for tilegrid nudges
			 * 2. IFF momentum is 0, attempt velocity
			 * 3. IFF velocity is > 0, displace according to normalized velocity
			 * 4. IFF velocity is 0, done
			 */

			// if(mx || my) {
			// 	/**
			// 	 * As long as there is momentum, displace according to momentum
			// 	 * and override velocities.
			// 	 */
			// 	let mx_sign = Math.sign(mx),
			// 		my_sign = Math.sign(my);

			// 	let dx = vx * dt,
			// 		dy = vy * dt;

			// 	if(mx) {
			// 		mx -= dx;
			// 		vx = mx_sign * speed;
			// 	}
				
			// 	if(my) {
			// 		my -= dy;
			// 		vy = my_sign * speed;
			// 	}

			// 	if(mx && (mx_sign * Math.sign(mx)) === -1) {
			// 		mx = 0;
			// 		vx = 0;
			// 	}
			// 	if(my && (my_sign * Math.sign(my)) === -1) {
			// 		my = 0;
			// 		vy = 0;
			// 	}
			// } else {
			// 	/**
			// 	 * Calculate if there should be momentum
			// 	 * Round to the nearest 0.5
			// 	 */
			// 	if(facing === 0 && vy) {
			// 		// facing RIGHT, velocity LEFT
			// 		mx = Helper.ceil(x, 2) - x + 0.5;
			// 	} else if(facing === 180 && vy) {
			// 		// facing LEFT, velocity RIGHT
			// 		mx = -(Helper.ceil(x, 2) - x) + 0.5;
			// 	} else if(facing === 90 && vx) {
			// 		// facing UP, velocity DOWN
			// 		my = Helper.ceil(y, 2) - y + 0.5;
			// 	} else if(facing === 270 && vx) {
			// 		// facing DOWN, velocity UP
			// 		my = -(Helper.ceil(y, 2) - y) + 0.5;
			// 	}
			// }

			// Move in 1 direction only, favor Y
			if(vx && vy) {
				vx = 0;
			}
			if(mx && my) {
				mx = 0;
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
			entity.world.mx = mx;
			entity.world.my = my;
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