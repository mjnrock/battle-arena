import Component from "../../../@agency/core/ecs/Component";
import Position from "../struct/Position";

export const Nomen = "position";

export default ({ nomen, seed = {}, ...opts }) => Component.Create(nomen || Nomen, {
	template: Position,
	seed: [{
		x: 0,
		y: 0,
		z: 0,

		...seed,
	}],

	...opts,
});