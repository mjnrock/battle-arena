import { useEffect } from "react";

import CreateGame from "../game/BattleArena";

import { PixiCanvas } from "../components/PixiCanvas";

import { Base64, PixelScaleCanvas } from "./../game/util/Base64";

//TODO: Move this somewhere -- it takes a pixel image and redraws it scaled by @factor (i.e. 1 pixel = @factor * pixels)
//? Maybe this should be a utility function in the game library?
Base64.DecodeFile("assets/images/squirrel.png").then(canvas => {
	console.log(PixelScaleCanvas(canvas, 5).toDataURL());
});

const game = CreateGame({
	// ...args,
});

export function GameRoute() {
	useEffect(() => {
		game.renderer.ticker.start();

		// console.log(game);
		// console.log(game.realm.worlds.overworld.nodes[ "0,0" ]);

		return () => {
			game.renderer.ticker.stop();
		};
	}, []);

	return (
		<PixiCanvas view={ game.renderer.canvas } />
	);
};

export default GameRoute;