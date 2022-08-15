import { Entity } from "./../../lib/ecs/Entity";

import { world } from "./../../components/world";
import { terrain } from "./../../components/terrain";
import { animation } from "./../../components/animation";

export class Node extends Entity {
	static Nomen = "node";
	static Components = [
		world,
		terrain,
		animation,
	];

	constructor ({ ...rest } = {}) {
		super({
			nomen: Node.Nomen,
			...rest,
		});
	}
};

export default Node;