import Entity from "./../@agency/core/ecs/Entity";
import Registry from "./../@agency/core/Registry";

import ComponentPosition from "../../data/components/Position";
import ComponentRegistry from "../../data/components/Registry";

export class Node extends Entity {
	constructor(x, y, entities = []) {
		super();

		this.registerMany([
			ComponentPosition(x, y),
		]);
		this.registerManyWithAlias({
			entities: ComponentRegistry(entities, {
				encoder: Registry.Encoders.InstanceOf(Entity),
			}),
		});

		//* Maybe build some Component Object Factories that initialize multiple Components with dynamic args
	}
};

export default Node;