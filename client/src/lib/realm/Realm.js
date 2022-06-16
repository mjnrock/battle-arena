import { EntityRegistrar } from "../../data/components/Registrar";
import Entity from "../@agency/lib/ecs/Entity";
import RealmMap from "./Map";

export class Realm extends Entity {
	constructor (maps = []) {
		super();

		this.register({
			maps: EntityRegistrar({}, {
				overworld: new RealmMap(),
			}),
		});

		console.log(987987, this.maps.overworld)
	}
};

export default Realm;