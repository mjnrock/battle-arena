export function game({ key, update, render } = {}) {
	return {
		/**
		 * The key used to identify the game in the Game registry
		 */
		key,

		/**
		 * The function that will be called on a "update" event
		 */
		update,

		/**
		 * The function that will be called on a "render" event
		 */
		render,
	};
};

export default game;