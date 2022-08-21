import Game from "../Game";
import Invoker from "../util/relay/Invoker";

export function game({ key, update, render } = {}) {
	const state = {
		/**
		 * The key used to identify the game in the Game registry
		 */
		key,

		/**
		 * The functions that will be called on a "update" event
		 */
		update: new Invoker([
			({ dt, now, game, subject }) => {
				subject.ai.process({ dt, now, game, subject });

				return true;
			},
		]),
		
		/**
		 * The functions that will be called on a "render" event
		 */
		draw: new Invoker(render),
	};

	if(update) {
		if(Array.isArray(update)) {
			for(let fn of update) {
				state.update.add(fn);
			}
		} else if(typeof update === "function") {
			state.update.add(update);
		}
	}

	if(render) {
		if(Array.isArray(render)) {
			for(let fn of render) {
				state.render.add(fn);
			}
		} else if(typeof render === "function") {
			state.render.add(render);
		}
	}

	return state;
};

export default game;