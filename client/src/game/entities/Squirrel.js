import { Creature } from "./Creature";

export class Squirrel extends Creature {
	static Alias = "squirrel";
	static Components = [
		...Creature.Components,
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