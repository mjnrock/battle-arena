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
			 * Encoder `this` must be bound to the ComponentRegistry, therefore cannot use lambda function
			 */
			encoder(id, value, type) {
				const isInstanceOf = Registry.Encoders.InstanceOf(Node)(id, value, type);

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
	
	static CreateGrid(width, height, each) {
		const map = new Map();
		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				const node = new Node(x, y);

				if(typeof each === "function") {
					each(node);
				}

				map.registerWithAlias(node, Map.PositionEncoder(node));
			}
		}

		return map;
	}
};

export default Map;