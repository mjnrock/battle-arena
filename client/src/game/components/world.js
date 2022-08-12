export function world({ world, x = 0, y = 0, vx = 0, vy = 0, speed = 2.5 } = {}) {
	return {
		world,
		x,
		y,
		vx,
		vy,
		speed,
	};
};

export default world;