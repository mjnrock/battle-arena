import Entity from "../@agency/core/ecs/Entity";
import Registry from "../@agency/core/Registry";

export class Realm extends Entity {
	constructor (maps = []) {
		super();

		//FIXME Create sharing and copying method for Registry
		
		this.Maps = new Registry(maps);
		this.Players = new Registry();
		this.Entities = new Registry();
	}
};

export default Realm;