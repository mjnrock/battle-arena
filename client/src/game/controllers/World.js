import { System } from "./../lib/ecs/System";

export class World extends System {
	static Nomen = "world";
	
	constructor({ ...opts } = {}) {
		super(opts);

		this.add(
			"move",
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
};

export default World;