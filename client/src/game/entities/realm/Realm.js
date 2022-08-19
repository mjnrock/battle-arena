import { Entity } from "./../../lib/ecs/Entity";
import { Registry } from "./../../lib/Registry";

export class Realm extends Entity {
	static Alias = "realm";
	static Components = {
		worlds: Registry,
	};

	constructor ({ worlds = {}, each, alias, ...rest } = {}) {
		super({
			alias: alias || Realm.Alias,
			init: {
				worlds,
			},

			...rest,
		});
	}
};

export default Realm;