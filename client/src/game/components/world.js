export function world({ world, x = 0, y = 0, vx = 0, vy = 0 } = {}) {
	return {
		world,
		x,
		y,
		vx,
		vy,
	};
};

export default world;