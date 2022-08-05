import { useEffect } from "react";
import { Pixi } from "../game/Pixi";

import { PixiCanvas } from "../components/PixiCanvas";

import { Game } from "./../game/Game";

const game = new Game();

console.log(game);
console.log(game.environment.entity.realm.worlds.overworld.nodes[ "1,1" ]);
console.log(game.realm.worlds.overworld.nodes[ "1,1" ]);

export function Test() {
	useEffect(() => {
		game.render.ticker.start();

		return () => {
			game.render.ticker.stop();
		};
	}, []);

	return (
		<PixiCanvas view={ game.render.canvas } />
	);
};

export default Test;