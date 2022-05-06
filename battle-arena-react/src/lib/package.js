// import Agency from "@lespantsfancy/agency";
import Context from "./@agency/core/Context";
import Agency from "./@agency/index";

import Game from "./Game";

import worldHandlers from "./data/handlers/world"

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});

	//? Context is the "Group Agent", @worldHandlers comes from /data
	const world = new Context([], {
		triggers: worldHandlers,
	});

	console.log(world);
	world.trigger("join", Date.now())

    return game;
}

export default {};