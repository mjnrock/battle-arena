import { Entity } from "./../../lib/ecs/Entity";

import { world } from "./../../components/world";
import { terrain } from "./../../components/terrain";

export class Node extends Entity {
	static Nomen = "node";
	static Components = [
		world,
		terrain,
	];

	constructor ({ ...rest } = {}) {
		super({
			nomen: Node.Nomen,
			...rest,
		});
	}
};

export default Node;