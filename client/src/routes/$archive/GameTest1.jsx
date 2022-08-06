import { useEffect } from "react";
import { Pixi } from "../game/lib/pixi/Pixi";

import { PixiCanvas } from "../components/PixiCanvas";

import { Game } from "./../game/Game";



export function initializeRealm(game) {
	//* World will automatically generate a Node grid based on @size
	const [ overworld ] = game.environment.factory.entity.world(1, {
		size: [ 10, 10 ],
	});
	//* Create the main realm
	const [ realm ] = game.environment.factory.entity.realm(1, {
		worlds: {
			overworld,
		},
	});
	
	return realm;
};

export function Test() {
	const game = new Game();

	useEffect(() => {
		game.render.ticker.start();
		
		initializeRealm(game);

		console.log(game);
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