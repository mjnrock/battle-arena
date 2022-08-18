import * as PixiJS from "pixi.js";
import { useState, useEffect } from "react";

import CreateGame from "../game/BattleArena";

import { PixiCanvas } from "../components/PixiCanvas";

import { Base64, PixelScaleCanvas } from "./../game/util/Base64";
import Game from "../game/Game";

// Base64.DecodeFile("assets/images/squirrel.png").then(canvas => {
// 	console.log(PixelScaleCanvas(canvas, 20).toDataURL());
// });

/**
 * FPS Array
 */
let logFPS = [];
export function GameRoute() {
	const [ game, setGame ] = useState();

	useEffect(() => {
		if(!Game.Get()) {
			CreateGame({
				bootstrap: {
					complete: (event, g, ...args) => setGame(g),
				},
			});
		}
	}, []);

	useEffect(() => {
		if(!game) {
			return;
		}
		
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
		game.renderer.ticker.add(() => {
			logFPS.push(~~game.renderer.ticker.FPS);

			if (logFPS.length > 250) {
				logFPS.shift();
			}

			/**
			 * Display the AVG FPS over the last 250 frames
			 */
			fps.text = ~~(logFPS.reduce((a, v) => a + v, 0) / logFPS.length);
		});

		return () => {
			game.loop.stop();
			game.renderer.ticker.stop();
		};
	}, [ game ]);

	if(!game) {
		return <div style={{
			width: "100%",
			height: "100vh",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			fontSize: "5em",
			fontFamily: "monospace",
		}}>Loading...</div>;
	}

	return (
		<PixiCanvas view={ game.renderer.canvas } />
	);
};

export default GameRoute;