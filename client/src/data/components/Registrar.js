import Component from "../../lib/@agency/lib/ecs/Component";
import Registry from "../../lib/@agency/lib/Registry";

export const Name = `Registrar`;

export function Registrar(entries = [], opts = {}, state = {}) {
	return new Component(Name, {
		registry: new Registry(entries, opts),

		...state,
	});
};

export default Registrar;