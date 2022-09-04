import { Entity } from "./../../../lib/ecs/Entity";
import { Collection } from "./../../../util/Collection";

export class Realm extends Entity {
	static Alias = "realm";
	static Components = {
		worlds: Collection,
	};

	constructor ({ worlds = {}, alias, ...rest } = {}) {
		super({
			alias: alias || Realm.Alias,
			components: {
				worlds,
			},

			...rest,
		});
	}
};

export default Realm;