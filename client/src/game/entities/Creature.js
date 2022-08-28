import { Entity } from "../lib/ecs/Entity";

import { game } from "../components/game";
import { world } from "../components/world";
import { animation } from "../components/animation";
import { ai } from "../components/ai";
import { status } from "../components/status";

export class Creature extends Entity {
	static Alias = "creature";
	static Components = {
		game,
		world,
		animation,
		ai,
		status,
	};

	constructor ({ components = [], id, tags, alias, init = {} } = {}) {
		super({
			alias: alias || Creature.Alias,
			components,
			id,
			tags,
			init,
		});
	}
};

export default Creature;