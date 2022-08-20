import { Entity } from "./../../lib/ecs/Entity";
import { Registry } from "./../../util/Registry";
import { Node } from "./Node";

export class World extends Entity {
	static Alias = "world";
	static Components = {
		size: (width, height) => ({
			width,
			height,
		}),
		nodes: Registry,
		entities: Registry,
	};

	constructor ({ size = [ 10, 10 ], nodes = {}, entities = {}, each, alias, ...rest } = {}) {
		super({
			alias: alias || World.Alias,
			init: {
				size,
				nodes,
			},

			...rest,
		});

		this.reseed(each);
	}

	get width() {
		return this.size.width;
	}
	get height() {
		return this.size.height;
	}

	reseed(each) {
		this.nodes.clear();

		const { width, height } = this.size;
		for(let w = 0; w < width; w++) {
			for(let h = 0; h < height; h++) {
				let alias = `${ w },${ h }`,
					node = new Node({
						init: {
							world: {
								world: this,
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
					this.nodes.registerWithAlias(node, alias);
				} else {
					this.nodes.register(node);
				}
			}
		}
	}
};

export default World;