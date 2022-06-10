import Entity from "./@agency/core/ecs/Entity";
import Registry from "./@agency/core/Registry";

import ComponentPosition from "../data/components/Position";
import ComponentRegistry from "../data/components/Registry";

export class Node extends Entity {
	constructor(x, y, entities = []) {
		super();

		//FIXME Currently the ComponentFactories here do not work.  Uncomment below to break.
		console.log(ComponentPosition(x, y));
		console.log(ComponentRegistry(entities));
		// this.registerComponent(ComponentPosition(x, y));
		// this.registerComponent(ComponentRegistry(entities));
		
		this.createComponent("position", {
			x,
			y,
		});
		this.createComponent("entities", {
			registry: new Registry(entities, {
				encoder: Registry.Encoders.InstanceOf(this, Entity),
			}),
		});
	}
};

export default Node;