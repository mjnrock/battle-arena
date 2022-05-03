// import Agency from "@lespantsfancy/agency";
import Agency from "./@agency/index";

import Game from "./Game";

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});

    return game;
}

export default {};