import { useEffect } from "react";
import { Pixi } from "../game/Pixi";

import { PixiCanvas } from "../components/PixiCanvas";

import { Game } from "./../game/Game";

const game = new Game();
const game2 = new Game();

console.log(game);
console.log(Game.Get());
console.log(game2);
console.log(Game.Get());
console.log(Game.Instances);

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