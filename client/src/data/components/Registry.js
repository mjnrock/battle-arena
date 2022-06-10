import Component from "../../lib/@agency/core/ecs/Component";
import AgencyRegistry from "../../lib/@agency/core/Registry";

export const Name = `registrar`;

export function Registry(entries = [], opts = {}, state = {}) {
	return new Component(Name, {
		registry: new AgencyRegistry(entries, opts),

		...state,
	});
};
export function TypedRegistry(clazz, entries = [], opts = {}, state = {}) {
	return new Component(Name, {
		registry: new AgencyRegistry(entries, {
			...opts,

			encoder: AgencyRegistry.Encoders.InstanceOf(this, clazz),
		}),

		...state,
	});
}

export default Registry;