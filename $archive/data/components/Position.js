export const Name = `position`;

export function Position({ x = 0, y = 0 } = {}) {
	return {
		x,
		y,
	};
};

export const DefaultPair = [ Name, Position ];

export default Position;