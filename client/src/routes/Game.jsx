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
		game.renderer.ticker.start();

		// console.log(game);
		// console.log(game.realm.worlds.overworld.nodes[ "0,0" ]);

		return () => {
			game.renderer.ticker.stop();
		};
	}, []);

	return (
		<>
			<div>IMPORTANT: Rendering offsets are currently a WIP, critically missing:</div>
			<ul>
				<li>PIXI parent-child position awareness, for localized offsets</li>
				<li>Mouse events are not relatively oriented</li>
			</ul>
			
			<PixiCanvas view={ game.renderer.canvas } />
		</>
	);
};

export default GameRoute;