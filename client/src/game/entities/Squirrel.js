import { Entity } from "./../lib/ecs/Entity";

import { game } from "./../components/game";
import { world } from "./../components/world";
import { animation } from "./../components/animation";

export class Squirrel extends Entity {
	static Alias = "squirrel";
	static Components = [
		game,
		world,
		animation,
	];

	constructor ({ components = [], id, tags, alias, init = {} } = {}) {
		super({
			alias: alias || Squirrel.Alias,
			components,
			id,
			tags,
			init,
		});
	}
};

export default Squirrel;