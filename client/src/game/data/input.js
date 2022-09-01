import { KeyController } from "../lib/input/KeyController";
import { MouseController } from "../lib/input/MouseController";

/**
 ** This is the main input trap for the game.  It should contain:
 * 	- key
 * 	- mouse
 */
export function loadInputControllers(game, { mouse, key } = {}) {
	game.input = {
		key: new KeyController(key),
		mouse: new MouseController(mouse),
	};

	/**
	 * Bind all event listeners here
	 */
	//? Intercept events from the input controllers by listening for events
	game.input.key.events.on(KeyController.EventTypes.KEY_PRESS, (e, self) => {
		if(e.code === "KeyC") {
			console.log(game.realm.players.current);
		} else if(e.code === "F3") {
			game.config.SHOW_DEBUG = !game.config.SHOW_DEBUG;

			//STUB: This needs to be formalized -- when Debug toggles off, the debug layers should be hidden
			for(let [ uuid, entity ] of game.realm.worlds.current.entities) {
				entity.animation.debug.visible = game.config.SHOW_DEBUG;
			}
		}
	});
	// game.input.mouse.events.on(MouseController.EventTypes.MOUSE_MOVE, (e, self) => console.log(e));

	return game;
};

export default loadInputControllers;