import Entity from "../@agency/core/ecs/Entity";
import Registry from "../@agency/core/Registry";

import { EntityRegistry } from "../../data/components/Registry";
import EMap from "./Map";

export class Realm extends Entity {
	constructor (maps = []) {
		super();

		this.Maps = new Registry(maps, {
			encoder: Registry.Encoders.InstanceOf(EMap),
		});

		this.register(EntityRegistry());
	}
};

export default Realm;