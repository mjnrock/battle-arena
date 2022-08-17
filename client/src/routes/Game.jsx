import { useEffect } from "react";

import CreateGame from "../game/BattleArena";

import { PixiCanvas } from "../components/PixiCanvas";

import { Base64, PixelScaleCanvas } from "./../game/util/Base64";

// Base64.DecodeFile("assets/images/squirrel.png").then(canvas => {
// 	console.log(PixelScaleCanvas(canvas, 20).toDataURL());
// });

const game = CreateGame({
	// ...args,
});

export function GameRoute() {
	useEffect(() => {
		//TODO: Have Game emit a "complete" event when it's done loading everything to kick-off the React part
		game.loop.events.add("tick", game);
		game.loop.start();
		game.renderer.ticker.start();
		
		return () => {
			game.loop.stop();
			game.renderer.ticker.stop();
		};
	}, []);

	return (
		<PixiCanvas view={ game.renderer.canvas } />
	);
};

export default GameRoute;