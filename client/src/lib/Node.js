import Entity from "./@agency/core/ecs/Entity";
import Registry from "./@agency/core/Registry";

export class Node extends Entity {
	constructor(x, y, entities = []) {
		super();

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