import Component from "./../../lib/@agency/lib/ecs/Component";

export const Name = `Position`;

export function Position(state = {}) {
	return new Component(Name, {
		x: 0,
		y: 0,

		...state,
	});
};

export default Position;