import { useEffect } from "react";

import { Game } from "../game/Game";
import { Hooks as BattleArena } from "../game/BattleArena";

import { PixiCanvas } from "../components/PixiCanvas";

const game = new Game({
	/**
	 * Overrides:	pre, init, post, update, render
	 */
	hooks: BattleArena,
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

export default Game;