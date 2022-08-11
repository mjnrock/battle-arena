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
			"ctrlKeyVeloc",
		);
	}

	join(entities = [], world) {
		System.Each(entities, (entity) => {
			//TODO: Add Entities to World, and add World to Entities
		});
		
		return entities;
	}
	leave(entities = [], world) {
		System.Each(entities, (entity) => {
			//TODO: Remove Entities from World, and remove World from Entities
		});
		
		return entities;
	}

	move(entities = [], { x, y, isDelta }) {
		System.Each(entities, (entity) => {
			if(isDelta) {
				entity.position.x += x;
				entity.position.y += y;
			} else {
				entity.position.x = x;
				entity.position.y = y;
			}
		});
		
		return entities;
	}

	veloc(entities = [], { vx, vy, isDelta }) {
		System.Each(entities, (entity) => {
			if(isDelta) {
				entity.position.vx += vx;
				entity.position.vy += vy;
			} else {
				entity.position.vx = vx;
				entity.position.vy = vy;
			}
		});
		
		return entities;
	}

	ctrlKeyVeloc(entities = [], { ctrl }) {
		const [ player ] = entities;

		if(ctrl.hasUp) {
			player.position.vy = -0.05;
		} else if(ctrl.hasDown) {
			player.position.vy = 0.05;
		} else {
			player.position.vy = 0;
		}

		if(ctrl.hasLeft) {
			player.position.vx = -0.05;
		} else if(ctrl.hasRight) {
			player.position.vx = 0.05;
		} else {
			player.position.vx = 0;
		}
	}
};

export default World;