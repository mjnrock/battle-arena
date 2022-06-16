import { EntityRegistrar } from "../../data/components/Registrar";
import Entity from "../@agency/lib/ecs/Entity";
import Map from "./Map";

export class Realm extends Entity {
	constructor () {
		super();

		this.register({
			maps: EntityRegistrar({}, {
				overworld: new Map(),
			}),
		});
	}
};

export default Realm;