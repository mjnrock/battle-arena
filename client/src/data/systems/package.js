import AgencyFactory from "../../lib/@agency/core/Factory";
import AgencyRegistry from "../../lib/@agency/core/Registry";

import SMap from "./Map";
import Node from "./Node";
import Portal from "./Portal";
import Position from "./Position";
import Terrain from "./Terrain";

export const Systems = {
	Map: SMap,
	Node: Node,
	Position: Position,
	Terrain: Terrain,
	Portal: Portal,
};

export const createSystemRegistry = game => {
	const registry = new AgencyRegistry();

	Object.entries(Systems).forEach(([ key, clazz ]) => {
		const comp = new AgencyFactory(clazz, [ game ], {
			name: key,
		});

		registry.registerWithAlias(comp, key);
	});

	return registry;
};

export default Systems;