import { Entity } from "../../../lib/ecs/Entity";
import { Registry } from "../../../lib/Registry";

export class Realm extends Entity {
	static Nomen = "realm";
	static Components = {
		worlds: Registry,
	};

	constructor ({ worlds = {}, each, ...rest } = {}) {
		super({
			nomen: Realm.Nomen,
			init: {
				worlds,
			},

			...rest,
		});
	}
};

export default Realm;