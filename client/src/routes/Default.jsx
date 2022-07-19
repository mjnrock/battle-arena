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
pixi.dependents.add({
	render(dt, px) {
		const { stage, graphics } = px;
		graphics.beginFill(0xFF0000);
		graphics.drawCircle(100 + Math.random() * 10, 100 + Math.random() * 10, 25);
		graphics.endFill();
	},
})
pixi.dependents.add({
	render(dt, px) {
		const { stage, graphics } = px;
		graphics.beginFill(0xFF00FF);
		graphics.drawCircle(500 + Math.random() * 10, 500 + Math.random() * 10, 25);
		graphics.endFill();
	},
});
const a = pixi.dependents.add((dt, px) => {
	const { stage, graphics } = px;
	graphics.beginFill(0x00FF00);
	graphics.drawCircle(500 + Math.random() * 10, 100 + Math.random() * 10, 25);
	graphics.endFill();
});
// console.log(a)
// setTimeout(() => {
// 	pixi.dependents.remove(a);
// }, 1500)

export function Default() {
	const { game } = useContext(Context);

	//* This is a debugging invocation of the renderer, and should be handled by MainLoop
	useEffect(() => {
		pixi.ticker.start();
		// const ticker = new PixiJS.Ticker();
		// console.log(ticker)
		// ticker.add(pixi.render.bind(pixi));
		// ticker.start();
		
		return () => {
			// ticker.stop();
			pixi.ticker.stop();
		};
	}, []);
	
	return (
		// <PixiCanvas app={ game.render.app } />
		<PixiCanvas view={ pixi.canvas } />
	);
};

export default Default;