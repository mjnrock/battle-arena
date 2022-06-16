import { EntityRegistrar } from "../../data/components/Registrar";
import Entity from "../@agency/lib/ecs/Entity";

export class Map extends Entity {
	constructor (nodes = []) {
		super();

		this.register({
			nodes: EntityRegistrar({}, nodes),
		});
	}
};

export default Map;