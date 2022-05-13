import Entity from "../@agency/core/ecs/Entity";

import { CreateComponent } from "../data/ecs/component/package";

/**
 * In this game, "EntityBase" is relabeled "Animus" and loaded with game-data base functions
 */
export class Animus extends Entity {
    constructor(components = [], agent = {}) {
        super([], agent);

		this.register(components);
    }

	register(key, value) {
		if(!Array.isArray(key) && typeof key === "object") {
			const obj = key;

			for(let [ nomen, args ] of Object.entries(obj)) {
				if(!Array.isArray(args)) {
					args = [ args ];
				}
	
				const comp = CreateComponent(nomen, ...args);
				super.register(comp);
			}
	
			return this;
		}

		return super.register(key, value);
	}

	
	toObject(includeId = true) {
		const obj = super.toObject(includeId);

		obj.components = {};
		for(let comp of this.components.values()) {
			obj.components[ comp.nomen ] = comp.toObject(includeId);
		}

		return obj;
	}
	toJson(includeId = true) {
		return JSON.stringify(this.toObject(includeId));
	}
}

export default Animus;