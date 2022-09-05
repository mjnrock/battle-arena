import { Entity } from "./../../../lib/ecs/Entity";
import { Collection } from "./../../../util/Collection";

export class Realm extends Entity {
	static Alias = "realm";
	static Components = {
		worlds: Collection,
	};

	constructor ({ worlds = {}, alias, ...components } = {}) {
		super({
			alias: alias || Realm.Alias,			
			worlds,

			...components,
		});
	}
};

export default Realm;