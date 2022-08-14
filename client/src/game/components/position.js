/**
 * This is designed to be used in situations where a position is needed abstractly.
 * For example, any "position" in meta data or space (e.g. a Node circuit).
 */
export function position({ x = 0, y = 0, z = 0 } = {}) {
	return {
		x,
		y,
		z,
	};
};

export default position;