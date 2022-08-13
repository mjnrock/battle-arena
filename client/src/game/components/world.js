export function world({ world, x = 0, y = 0, vx = 0, vy = 0, speed = 2.5, facing = 0 } = {}) {
	return {
		world,
		x,
		y,
		vx,
		vy,
		speed,
		facing,
	};
};

export default world;