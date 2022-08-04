import Entity from "./../../lib/ecs/Entity";

import { DefaultPair as PositionPair } from "./../components/Position";

export class Squirrel extends Entity {
	static Name = "squirrel";
	static Components = [
		PositionPair,
	];

	constructor ({ components = [], id, tags, init = {} } = {}) {
		super({
			name: Squirrel.Name,
			components,
			id,
			tags,
			init,
		});
	}
};

export default Squirrel;