import Entity from "./../../lib/ecs/Entity";
import Registry from "./../../lib/Registry";

export const Name = `registrar`;

export function Registrar(state = {}, entries = [], opts = {}) {
	return {
		name: Name,

		registry: new Registry(entries, opts),

		...state,
	};
};

export function EntityRegistrar(state = {}, entities = [], opts = {}) {
	return Registrar(state, entities, {
		encoder: Registry.Encoders.InstanceOf(Entity),
		classifiers: [
			Registry.Classifiers.InstanceOf(true),
			Registry.Classifiers.Tagging({
				nameTagging: true,	// `#${ .name }`
			}),
		],

		...opts,
	});
};

export const DefaultPair = [ Name, Registrar ];
export const EntityRegistrarPair = [ Name, EntityRegistrar ];

export default Registrar;