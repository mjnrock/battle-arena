import { Name as PositionName, Position } from "./Position";
import { Name as RegistryName, Registry } from "./Registry";

export const Dictionary = [
	[ PositionName, Position ],
	[ RegistryName, Registry ],
];

// export const Dictionary = [
// 	[ PositionName, (x, y) => {
// 		return new Component(Name, {
// 			x,
// 			y,
// 		});
// 	} ],
// 	[ RegistryName, (entries = [], opts = {}) => {
// 		return new Component(Name, {
// 			registry: new AgencyRegistry(entries, opts),
// 		});
// 	} ],
// ];