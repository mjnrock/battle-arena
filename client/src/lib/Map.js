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
			}, {
				/**
				 * Additional functions/state may be added here
				 */
				node(input) {
					if(Array.isArray(input)) {
						return this.registry.get(input[ 0 ]);
					}
		
					return this.registry.get(input);
				},
			}),
		});

		this.addChildren(nodes);
	}
};

export default Map;