import * as PixiJS from "pixi.js";
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
		//TODO: Have Game emit a "complete" event when it"s done loading everything to kick-off the React part
		game.loop.events.add("tick", game);
		game.loop.start();
		game.renderer.ticker.start();

		/**
		 * Write the FPS to the screen each draw
		 */
		const skewStyle = new PixiJS.TextStyle({
			fontFamily: "Arial",
			dropShadow: true,
			dropShadowAlpha: 0.8,
			dropShadowAngle: 2.1,
			dropShadowBlur: 4,
			dropShadowColor: "0x111111",
			dropShadowDistance: 10,
			fill: [ "#ffffff" ],
			stroke: "#004620",
			fontSize: 60,
			fontWeight: "lighter",
			lineJoin: "round",
			strokeThickness: 12,
		});
		const fps = new PixiJS.Text(0, skewStyle);
		game.renderer.stage.addChild(fps);
		game.renderer.ticker.add(() => fps.text = ~~game.renderer.ticker.FPS);

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