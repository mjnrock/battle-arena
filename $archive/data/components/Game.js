export const Name = `game`;

export function Game({ key, render, update } = {}) {
	return {
		key,
		render,
		update,
	};
};

export const DefaultPair = [ Name, Game ];

export default Game;