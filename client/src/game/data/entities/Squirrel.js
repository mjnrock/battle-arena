import Entity from "./../../lib/ecs/Entity";

import { DefaultPair as PositionPair } from "./../components/Position";

export class Squirrel extends Entity {
	static Components = [
		PositionPair,
	];

	constructor ({ components = [], id, tags, init = {} } = {}) {
		super({
			name: "squirrel",
			components,
			id,
			tags,
			init,
		});
	}
};

export default Squirrel;