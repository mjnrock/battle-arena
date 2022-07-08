import Entity from "./../../lib/ecs/Entity";

import { DefaultPair as PositionPair } from "./../components/Position";

export class Squirrel extends Entity {
	static Components = [
		PositionPair,
	];

	constructor ({ components = [], id, tags, args = {} } = {}) {
		super({
			name: "squirrel",
			components,
			id,
			tags,
			args,
		});
	}
};

export default Squirrel;