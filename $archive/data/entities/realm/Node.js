import { Entity } from "../../../lib/ecs/Entity";

import { DefaultPair as PositionPair } from "../../components/Position";
import { DefaultPair as TerrainPair } from "../../components/Terrain";

export class Node extends Entity {
	static Nomen = "node";
	static Components = [
		PositionPair,
		TerrainPair,
	];

	constructor ({ ...rest } = {}) {
		super({
			nomen: Node.Nomen,
			...rest,
		});
	}
};

export default Node;