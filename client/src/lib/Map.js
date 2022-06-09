import Entity from "./@agency/core/ecs/Entity";
import Registry from "./@agency/core/Registry";
import { singleOrArrayArgs } from "./@agency/util/helper";
import Node from "./Node";

export class Map extends Entity {
	constructor(nodes = []) {
		super();

		this.createComponent("position", {
			x: 0,
			y: 0,
		});

		if(typeof nodes === "function") {
			nodes = nodes(this);
		}
		nodes = singleOrArrayArgs(nodes);

		this.createComponent("nodes", {
			registry: new Registry(nodes, {
				encoder: Registry.Encoders.InstanceOf(this, Node),
			}),
		});

		this.addChildren(nodes);
	}
};

export default Map;