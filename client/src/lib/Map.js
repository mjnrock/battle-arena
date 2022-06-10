import Entity from "./@agency/core/ecs/Entity";
import Registry from "./@agency/core/Registry";
import { singleOrArrayArgs } from "./@agency/util/helper";

import Node from "./Node";

import ComponentRegistry from "../data/components/Registry";

export class Map extends Entity {
	static PositionEncoder = node =>  `${ node.position.x }.${ node.position.y }`;

	constructor(nodes = []) {
		super();

		if(typeof nodes === "function") {
			nodes = nodes(this);
		}
		nodes = singleOrArrayArgs(nodes);

		this.registerComponents({
			nodes: ComponentRegistry([], {
				encoder: Registry.Encoders.InstanceOf(this, Node),
			}),
		});

		this.addChildren(nodes);
	}
};

export default Map;