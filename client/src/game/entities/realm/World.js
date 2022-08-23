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

		//TODO: Figure out this kind of stuff
		config: (config = {}) => ({
			spawn: [ 0, 0 ],

			...config,
		}),
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

	node(x, y) {
		return this.nodes[ `${ ~~x },${ ~~y }` ];
	}
	isWithinBounds(x, y) {
		return x >= 0 && (x <= this.width - 1)
			&& y >= 0 && (y <= this.height - 1);
	}
	adjacent(x, y, addDiagonals = false) {
		//!GRID-NUDGE
		let [ xn, yn ] = [ ~~x, ~~y ];

		let dirs = [
			[ 0, -1 ],
			[ 1, 0 ],
			[ 0, 1 ],
			[ -1, 0 ],
		];

		if(addDiagonals) {
			dirs = [
				...dirs,

				[ 1, -1 ],
				[ 1, 1 ],
				[ -1, 1 ],
				[ -1, -1 ],
			]
		}

		const neighs = [];
		for(let [ dx, dy ] of dirs) {
			if((xn + dx >= 0) && (xn + dx < this.width) && (yn + dy >= 0) && (yn + dy < this.height)) {
				neighs.push([
					xn + dx,
					yn + dy,
				]);
			}
		}

		return neighs;
	}
	cost(x, y) {
		const node = this.node(x, y);
		if(!node) {
			return Infinity;
		}

		return node.terrain.cost;
	}
};

export default World;