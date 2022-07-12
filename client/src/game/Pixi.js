import * as PixiJS from "pixi.js";

export class Pixi {
	constructor () {
		this.app = new PixiJS.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			antialias: true,
			resolution: window.devicePixelRatio || 1,
		});


		const graphics = new PixiJS.Graphics();

		// Rectangle
		graphics.beginFill(0xDE3249);
		graphics.drawRect(50, 50, 100, 100);
		graphics.endFill();

		this.app.stage.addChild(graphics);
	}
};

export default Pixi;