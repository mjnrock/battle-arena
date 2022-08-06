import { Entity } from "./../lib/ecs/Entity";

import { game } from "./../components/game";
import { position } from "./../components/position";

export class Squirrel extends Entity {
	static Nomen = "squirrel";
	static Components = [
		game,
		position,
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