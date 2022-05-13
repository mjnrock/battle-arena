import Component from "../../../@agency/core/ecs/Component";

import Position from "../struct/Position";
import Terrain from "../struct/Terrain";

export const ComponentMap = (() => {
	const map = new Map();
	const comps = [
		Position,
		Terrain,
	];

	for(let comp of comps) {
		map.set(comp.Nomen, comp);
	}

	return map;
})();

export function CreateComponent(nomen, seed = {}, opts = {}) {
	return Component.Create(nomen, {
		template: ComponentMap.get(nomen),
		seed: [ seed, { evaluateState: true }],

		...opts,
	});
}

export default ComponentMap;