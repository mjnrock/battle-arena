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

		this.Nodes = new Registry(nodes, {
			/**
			 * Encoder `this` must be bound to the ComponentRegistry, therefore cannot use lambda function
			 */
			classifiers: [
				(id, value) => {
					if(value instanceof Node) {
						this.addAlias(id, Map.PositionEncoder(value));
					}
				},
			],
			encoder: Registry.Encoders.InstanceOf(Node),
		});
	}
	
	static CreateGrid(width, height, each) {
		const nodes = {};
		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				const node = new Node(x, y);

				if(typeof each === "function") {
					each(node);
				}
				
				nodes[ Map.PositionEncoder(node) ] = node;
			}
		}

		return new Map(nodes);
	}
};

export default Map;