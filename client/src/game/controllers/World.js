import { System } from "./../lib/ecs/System";
import Helper from "./../util/helper";

export class World extends System {
	static Nomen = "world";

	constructor ({ ...opts } = {}) {
		super(opts);

		this.add(
			"join",
			"leave",
			"displace",
			"move",
			"veloc",
			"inputKeyVeloc",
		);
	}

	join(entities = [], world) {
		System.Each(entities, (entity) => {
			//TODO: Add Entities to World
			entity.world = this;
		});

		return entities;
	}
	leave(entities = [], world) {
		System.Each(entities, (entity) => {
			//TODO: Remove Entities from World
			entity.world = null;
			entity.x = null;
			entity.y = null;
			entity.vx = null;
			entity.vy = null;
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
			// Move in 1 direction only, favor Y
			if(entity.world.vx && entity.world.vy) {
				entity.world.vx = 0;
			}

			//TODO: Displace the entity in alignment with momentum for tilegrid nudges (also requires using CENTER of shape, not TOPLEFT)
			let margin = 0.05,
				scalar = 20,
				nudge = 0;	// 0 = no nudge, 0.5 = middle of tile

			if(entity.world.vx) {
				if(entity.world.vx > 0) {
					entity.world.facing = 0;
				} else if(entity.world.vx < 0) {
					entity.world.facing = 180;
				}

				let div = Helper.floor(entity.world.y, scalar) % 1;
				
				if(Helper.near(div, nudge, margin, scalar) || Helper.near(div, -nudge, margin, scalar)) {
					entity.world.y = ~~entity.world.y + nudge;
					entity.world.vy = 0;
				} else {
					entity.world.vy = Math.sign(entity.world.vx) * entity.world.speed;
					entity.world.vx = 0;
				}
			} else if(entity.world.vy) {
				if(entity.world.vy > 0) {
					entity.world.facing = 270;
				} else if(entity.world.vy < 0) {
					entity.world.facing = 90;
				}
				
				let div = Helper.floor(entity.world.x, scalar) % 1;
				
				if(Helper.near(div, nudge, margin, scalar) || Helper.near(div, -nudge, margin, scalar)) {
					entity.world.x = ~~entity.world.x + nudge;
					entity.world.vx = 0;
				} else {
					entity.world.vx = Math.sign(entity.world.vy) * entity.world.speed;
					entity.world.vy = 0;
				}
			}

			// if(entity.world.vx) {
			// 	if(entity.world.vx > 0) {
			// 		if()
			// 	} else {
			// 		entity.world.x += entity.world.vx * dt;
			// 	}
			// } else if(entity.world.vy) {

			// }

			entity.world.x += (entity.world.vx * dt);
			entity.world.y += (entity.world.vy * dt);
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