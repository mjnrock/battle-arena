import { Entity } from "./../../../lib/ecs/Entity";
import { Registry } from "./../../../util/Registry";

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

	constructor ({ alias, ...rest } = {}) {
		super({
			alias: alias || Node.Alias,
			...rest,
		});
	}
};

export default Node;