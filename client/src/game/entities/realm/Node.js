import { Entity } from "./../../lib/ecs/Entity";
import { Registry } from "./../../lib/Registry";

import { world } from "./../../components/world";
import { terrain } from "./../../components/terrain";
import { animation } from "./../../components/animation";

export class Node extends Entity {
	static Alias = "node";
	static Components = {
		world,
		terrain,
		animation,
		entities: Registry,
	};

	constructor ({ ...rest } = {}) {
		super({
			alias: Node.Alias,
			...rest,
		});
	}
};

export default Node;