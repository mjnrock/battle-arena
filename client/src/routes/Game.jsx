import { useEffect } from "react";
import { Pixi } from "../game/lib/pixi/Pixi";

import { PixiCanvas } from "../components/PixiCanvas";

import { Game } from "../game/Game";

export function Test() {
	const game = new Game();

	useEffect(() => {
		game.render.ticker.start();

		// console.log(game);
		console.log(game.realm.worlds.overworld.nodes[ "0,0" ]);

		return () => {
			game.render.ticker.stop();
		};
	}, []);

	return (
		<PixiCanvas view={ game.render.canvas } />
	);
};

export default Test;