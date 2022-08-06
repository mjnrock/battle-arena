import * as PixiJS from "pixi.js";

export const Name = `pixi`;

export function Pixi({ width, height } = {}) {
	const renderer = new PixiJS.Renderer({
		width: width || window.innerWidth,
		height: height || window.innerHeight,
		resolution: window.devicePixelRatio || 1,
		autoDensity: true,
	});

	const resize = () => renderer.resize(window.innerWidth, window.innerHeight);
	window.addEventListener("resize", resize);

	const ticker = new PixiJS.Ticker();

	return {
		renderer,
		ticker,
	};
};

export const DefaultPair = [ Name, Pixi ];

export default Pixi;