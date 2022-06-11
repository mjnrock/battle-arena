import Entity from "../@agency/core/ecs/Entity";
import Registry from "../@agency/core/Registry";

import ComponentRegistry, { EntityRegistry } from "../../data/components/Registry";
import EMap from "./Map";

export class Realm extends Entity {
	constructor (maps = []) {
		super();

		this.Maps = new Registry(maps, {
			encoder: Registry.Encoders.InstanceOf(EMap),
		});

		this.registerComponent(EntityRegistry());
	}
};

export default Realm;