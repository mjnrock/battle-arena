import { useEffect } from "react";
import { Pixi } from "../game/Pixi";

import { PixiCanvas } from "../components/PixiCanvas";

import { Game } from "./../game/Game";

const game = new Game();

console.log(game);
console.log(game.environment);
console.log(game.environment.system.mainloop);
console.log(game.environment.entity);
console.log(game.environment.factory.system.mainloop);
console.log(game.environment.factory.entity.squirrel);

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