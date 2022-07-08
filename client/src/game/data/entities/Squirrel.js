import Entity from "./../../lib/ecs/Entity";

import { Name as PositionName, Position } from "./../components/Position";

export class Squirrel extends Entity {
	static Components = {
		[ PositionName ]: Position,
	};

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