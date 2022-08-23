import { Entity } from "../lib/ecs/Entity";

import { game } from "../components/game";
import { world } from "../components/world";
import { animation } from "../components/animation";
import { ai } from "../components/ai";

export class Creature extends Entity {
	static Alias = "creature";
	static Components = [
		game,
		world,
		animation,
		ai,
	];

	constructor ({ components = [], id, tags, alias, init = {} } = {}) {
		super({
			alias: alias || Creature.Alias,
			components,
			id,
			tags,
			init,
		});

		this.ai.wayfinder.entity = this;
	}
};

export default Creature;