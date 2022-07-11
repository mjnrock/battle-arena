import Entity from "../../../lib/ecs/Entity";
import Registry from "../../../lib/Registry";
import { Node } from "./Node";

export class World extends Entity {
	static Components = [];

	constructor ({ size = [ 10, 10 ], nodes = {}, entities = {}, ...rest } = {}) {
		super({
			name: "world",
			components: {
				size: {
					width: size[ 0 ],
					height: size[ 1 ],
				},
				nodes: new Registry(nodes),
				entities: new Registry(entities),
			},
			...rest,
		});

		for(let w = 0; w < size[ 0 ]; w++) {
			for(let h = 0; h < size[ 1 ]; h++) {
				this.nodes.register({
					[ `${ w },${ h }` ]: new Node({
						init: {
							position: {
								x: w,
								y: h,
							},
						},
					}),
				});
			}
		}
	}
};

export default World;