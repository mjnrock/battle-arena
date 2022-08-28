import { Creature } from "./Creature";

export class Bunny extends Creature {
	static Alias = "bunny";
	static Components = {
		...Creature.Components,
	};

	constructor ({ components = [], id, tags, alias, init = {} } = {}) {
		super({
			alias: alias || Bunny.Alias,
			components,
			id,
			tags,
			init,
		});
	}
};

export default Bunny;