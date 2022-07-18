import { useEffect, useContext } from "react";

import { Context } from "./../App";

import { PixiCanvas } from "../components/PixiCanvas";


import * as PixiJS from "pixi.js";
// import testPixiMatter from "../PixiMatterTest";
import Pixi from "../game/Pixi";

const pixi = new Pixi({
	width: 500,
	height: 500,
});

export function Default() {
	const { game } = useContext(Context);

	//* This is a debugging invocation of the renderer, and should be handled by MainLoop
	useEffect(() => {
		const ticker = new PixiJS.Ticker();
		console.log(ticker)
		ticker.add(pixi.render.bind(pixi));
		ticker.start();

		return () => {
			ticker.stop();
		};
	}, []);
	
	return (
		// <PixiCanvas app={ game.render.app } />
		<PixiCanvas view={ pixi.canvas } />
	);
};

export default Default;