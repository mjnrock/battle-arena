import Component, { ComponentRegistry } from "../../lib/@agency/lib/ecs/Component";
import Entity from "../../lib/@agency/lib/ecs/Entity";
import Registry from "../../lib/@agency/lib/Registry";

export const Name = `Registrar`;

export function Registrar(state = {}, entries = [], opts = {}) {
	return new Component(Name, {
		registry: new Registry(entries, opts),

		...state,
	});
};

export function EntityRegistrar(state = {}, entities = [], opts = {}) {
	return new ComponentRegistry(Name, state, {
		entries: entities,
		registryOpts: {
			encoder: Registry.Encoders.InstanceOf(Entity),
			classifiers: [
				Registry.Classifiers.Tagging({
					nameTagging: true,	// `#${ .name }`
				}),
			],
		},
		
		...opts,
	});
};

export default Registrar;