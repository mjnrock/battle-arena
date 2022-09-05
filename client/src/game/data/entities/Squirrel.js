import { Creature } from "./Creature";

export class Squirrel extends Creature {
	static Alias = "squirrel";
	static Components = {
		...Creature.Components,
	};

	constructor ({ alias, ...components } = {}) {
		super({
			alias: alias || Squirrel.Alias,
			...components,
		});
	}
};

export default Squirrel;