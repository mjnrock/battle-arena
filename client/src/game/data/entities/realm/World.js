import { Entity } from "../../../lib/ecs/Entity";
import { Registry } from "../../../lib/Registry";
import { Node } from "./Node";

export class World extends Entity {
	static Nomen = "world";
	static Components = {
		size: (width, height) => ({
			width,
			height,
		}),
		nodes: Registry,
	};

	constructor ({ size = [ 10, 10 ], nodes = {}, entities = {}, each, ...rest } = {}) {
		super({
			nomen: World.Nomen,
			init: {
				size,
				nodes,
			},

			...rest,
		});

		this.reseed(each);
	}

	reseed(each) {
		this.nodes.clear();

		const { width, height } = this.size;
		for(let w = 0; w < width; w++) {
			for(let h = 0; h < height; h++) {
				let alias = `${ w },${ h }`,
					node = new Node({
						init: {
							position: {
								x: w,
								y: h,
							},
						},
					});

				if(typeof each === "function") {
					[ alias, node ] = each({
						node,
						x: w,
						y: h,
						alias,
					});
				}

				if(!!alias) {
					this.nodes.register({
						[ alias ]: node,
					});
				} else {
					this.nodes.register(node);
				}
			}
		}
	}
};

export default World;