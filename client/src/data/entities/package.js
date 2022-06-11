import AgencyFactory from "../../lib/@agency/core/Factory";
import AgencyRegistry from "../../lib/@agency/core/Registry";

import Squirrel from "./Squirrel";

export const Entities = {
	Squirrel: Squirrel,
};

export const createEntityRegistry = game => {
	const registry = new AgencyRegistry();

	Object.entries(Entities).forEach(([ key, clazz ]) => {
		const comp = new AgencyFactory(clazz, [ game ], {
			name: key,
		});

		registry.registerWithAlias(comp, key);
	});

	return registry;
};

export default Entities;