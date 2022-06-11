import Entity from "../@agency/core/ecs/Entity";
import Registry from "../@agency/core/Registry";
import { singleOrArrayArgs } from "../@agency/util/helper";

import Node from "./Node";


export class Map extends Entity {
	static PositionEncoder = node => `${ node.position.x }.${ node.position.y }`;

	constructor (nodes = []) {
		super();

		if(typeof nodes === "function") {
			nodes = nodes(this);
		}
		nodes = singleOrArrayArgs(nodes);

		this.Nodes = new Registry([], {
			/**
			 * Encoder `this` must be bound to the ComponentRegistry, therefor cannot use lambda function
			 */
			encoder(id, value, type) {
				const isInstanceOf = Registry.Encoders.InstanceOf(this, Node)(id, value, type);

				if(isInstanceOf) {
					/**
					 * Create a position-based alias for the Node
					 */
					return Registry.Encoders.SetVariant(this, Map.PositionEncoder(value), id);	//* sic (order of args)
				}

				return false;
			},
		});

		this.addChildren(nodes);
	}
};

export default Map;