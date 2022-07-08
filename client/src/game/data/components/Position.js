export const Name = `position`;

export function Position(state = {}) {
	return {
		name: Name,

		x: 0,
		y: 0,

		...state,
	};
};

export const DefaultPair = [ Name, Position ];

export default Position;