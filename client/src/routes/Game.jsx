import { useEffect } from "react";
import { Pixi } from "../game/lib/pixi/Pixi";

import { PixiCanvas } from "../components/PixiCanvas";

import { Game } from "../game/Game";

const game = new Game();

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

export default Game;