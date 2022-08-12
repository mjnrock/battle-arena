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
			
			//TODO: Displace Entities while keeping them within the tile paths

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