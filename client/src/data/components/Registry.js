import Entity from "./../../lib/@agency/lib/ecs/Entity";
import Component from "./../../lib/@agency/lib/ecs/Component";
import AgencyRegistry from "./../../lib/@agency/lib/Registry";


export const Name = `registrar`;

export function Registry(entries = [], opts = {}, state = {}) {
	return new Component(Name, {
		registry: new AgencyRegistry(entries, opts),

		...state,
	});
};
// export function TypedRegistry(clazz, entries = [], opts = {}, state = {}) {
// 	return new Component(Name, {
// 		registry: new AgencyRegistry(entries, {
// 			...opts,

// 			encoder: AgencyRegistry.Encoders.InstanceOf(clazz),
// 		}),

// 		...state,
// 	});
// };

// /**
//  * 
//  * @param {*} entries 
//  * @param {*} opts 
//  * @param {*} state 
//  * @returns 
//  */
// export const EntityRegistry = (entries = [], opts = {}, state = {}) => {
// 	const comp = new Component(`entities`, {
// 		registry: new AgencyRegistry(entries, {
// 			...opts,

// 			encoder: AgencyRegistry.Encoders.InstanceOf(Entity),
// 		}),

// 		...state,
// 	});

// 	return comp;
// };

export default Registry;