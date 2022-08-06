import { Entity } from "./../../lib/ecs/Entity";

import { position } from "./../../components/position";
import { terrain } from "./../../components/terrain";

export class Node extends Entity {
	static Nomen = "node";
	static Components = [
		position,
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