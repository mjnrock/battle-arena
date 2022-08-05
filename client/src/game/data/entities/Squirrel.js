import Entity from "./../../lib/ecs/Entity";

import { DefaultPair as GamePair } from "./../components/Game";
import { DefaultPair as PositionPair } from "./../components/Position";

export class Squirrel extends Entity {
	static Nomen = "squirrel";
	static Components = [
		GamePair,
		PositionPair,
	];

	constructor ({ components = [], id, tags, init = {} } = {}) {
		super({
			nomen: Squirrel.Nomen,
			components,
			id,
			tags,
			init,
		});
	}
};

export default Squirrel;