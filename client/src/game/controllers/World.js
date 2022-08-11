import { System } from "./../lib/ecs/System";

export class World extends System {
	static Nomen = "world";
	
	constructor({ ...opts } = {}) {
		super(opts);

		this.add(
			"join",
			"leave",
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

		if(keyCtrl.hasUp) {
			player.world.vy = -0.05;
		} else if(keyCtrl.hasDown) {
			player.world.vy = 0.05;
		} else {
			player.world.vy = 0;
		}

		if(keyCtrl.hasLeft) {
			player.world.vx = -0.05;
		} else if(keyCtrl.hasRight) {
			player.world.vx = 0.05;
		} else {
			player.world.vx = 0;
		}
	}
};

export default World;