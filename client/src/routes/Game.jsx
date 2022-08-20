import * as PixiJS from "pixi.js";
import React, { useState, useEffect } from "react";

import Game from "../game/Game";
import CreateGame from "../game/BattleArena";
import { Registry } from "./../game/util/Registry";

import { PixiCanvas } from "../components/PixiCanvas";

export const Context = React.createContext({
	/**
	 * This will be populated with the GPS result
	 */
	geolocation: {},

	/**
	 * This will be a collection of (optionally aliases) geofencing polygons
	 */
	geofences: new Registry(),
});

export function useGeolocation() {
	if(!window.navigator.geolocation) {
		throw new Error("Geolocation is not supported");
	}


	const ctx = React.useContext(Context);
	const [ position, setPosition ] = React.useState(false);
	const refresh = () => window.navigator.geolocation.getCurrentPosition(pos => {
		ctx.geolocation = pos;

		setPosition(pos);
	});
	// }, err => { }, { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true });

	React.useEffect(refresh, []);

	return [ position, refresh ];
}

/**
 * FPS Array
 */
let logFPS = [];
export function GameRoute() {
	// const { geolocation } = React.useContext(Context);
	const [ game, setGame ] = useState();

	// const [ position, refresh ] = useGeolocation();

	// console.log(position)
	// console.log(geolocation)

	useEffect(() => {
		/**
		 * IFF default singleton has not been created, create it.
		 */
		if(!Game.Get()) {
			CreateGame({
				bootstrap: {
					complete: (event, g, ...args) => {
						g.loop.events.add("tick", g);
						g.loop.start();
						g.renderer.ticker.start();

						setGame(g);
					}
				},
			});
		}
	}, []);

	useEffect(() => {
		if(!game) {
			return;
		}

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

			if(logFPS.length > 250) {
				logFPS.shift();
			}

			/**
			 * Display the AVG FPS over the last 250 frames
			 */
			fps.text = ~~(logFPS.reduce((a, v) => a + v, 0) / logFPS.length);
		});
	}, [ game ]);

	if(!game) {
		return <div style={ {
			width: "100%",
			height: "100vh",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			fontSize: "5em",
			fontFamily: "monospace",
		} }>Loading...</div>;
	}

	return (
		<>
			{/* <button onClick={ refresh }>Get Position ( position )</button> */}
			<PixiCanvas view={ game.renderer.canvas } />
		</>
	);
};

export default GameRoute;