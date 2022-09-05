import { Creature } from "./Creature";

export class Bunny extends Creature {
	static Alias = "bunny";
	static Components = {
		...Creature.Components,
	};

	constructor ({ alias, ...components } = {}) {
		super({
			alias: alias || Bunny.Alias,
			...components,
		});
	}
};

export default Bunny;