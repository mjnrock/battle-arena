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
			nodes: ComponentRegistry(),
		});
		this.registerComponents({
			nodes: ComponentRegistry([], {
				encoder: Registry.Encoders.InstanceOf(this.nodes.registry, Node),
			}),
		});
		this.nodes.registry.encoder = (id, value, type) => {
			const isInstanceOf = Registry.Encoders.InstanceOf(this.nodes.registry, Node)(id, value, type);

			if(isInstanceOf) {
				return Registry.Encoders.SetVariant(this.nodes.registry, Map.PositionEncoder(value), id);	//* sic (order of args)
			}

			return false;
		};

		this.addChildren(nodes);
	}
};

export default Map;