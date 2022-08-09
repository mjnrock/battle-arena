import { useEffect } from "react";

import CreateGame from "../game/BattleArena";

import { PixiCanvas } from "../components/PixiCanvas";

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