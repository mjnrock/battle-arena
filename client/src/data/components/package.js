import AgencyFactory from "../../lib/@agency/core/Factory";
import AgencyRegistry from "../../lib/@agency/core/Registry";

import Registry, { Name as RegistryName } from "./Registry";
import Position, { Name as PositionName }  from "./Position";

export const Components = {
	[ RegistryName ]: Registry,
	[ PositionName ]: Position,
};

export const createComponentRegistry = game => {
	const registry = new AgencyRegistry();

	Object.entries(Components).forEach(([ key, clazz ]) => {
		const comp = new AgencyFactory(clazz, [], {
			name: key,
		});

		registry.registerWithAlias(comp, key);
	});

	return registry;
};

export default Components;