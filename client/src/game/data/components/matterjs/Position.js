import Matter from "matter-js";

export const Name = `position`;

export function Position({ x = 0, y = 0 } = {}) {
	return Matter.Vector.create(x, y);
};

export const DefaultPair = [ Name, Position ];

export default Position;