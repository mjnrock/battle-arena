import Component from "./../../lib/@agency/lib/ecs/Component";

export const Name = `Position`;

export function Position(x, y) {
	return new Component(Name, {
		x,
		y,
	});
};

export default Position;