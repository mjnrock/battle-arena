import * as PixiJS from "pixi.js";

/**
 * This is the main render wrapper class.  All rendering should be done through this class,
 * loading assets, creating sprites, and rendering the scene.  The asset loader is also present,
 * and should be the single source of truth for loaded assets.  This class does NOT contain
 * a game loop, but instead relies on external invocation of the .render method.
 */
export class Pixi {
	constructor ({ width, height } = {}) {
		this.config = {
			width: width || window.innerWidth,
			height: height || window.innerHeight,
			current: {
				container: "default",
				overlay: "default",
			},
		};

		/**
		 * The default loader for PixiJS, store all of the assets in memory here.
		 */
		this.loader = new PixiJS.Loader();

		/**
		 * The default renderer for PixiJS, this is the main renderer for all screen drawing.
		 */
		this.renderer = new PixiJS.Renderer({
			width: this.config.width,
			height: this.config.height,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
		});

		/**
		 * The main containers for the renderer.
		 */
		this.containers = new Map();

		/**
		 * These are PIXI.Graphics objects that are used to draw on the screen.
		 */
		this.overlays = new Map();


		//TODO Load textures with this.loader, map them to Entities; add/remove them to the stage, as appropriate
	
		//TODO Add a resize event listener to the window

		//TODO Bind mouse events

		this.init();
	}

	init() {
		this.containers.set("default", new PixiJS.Container());
		this.overlays.set("default", new PixiJS.Graphics());

		this.stage.addChild(this.graphics);

		return this;
	}

	/**
	 * The canvas of the renderer.
	 */
	get canvas() {
		return this.renderer.view;
	}

	/**
	 * A getter for the current container, specified in the config.
	 */
	get stage() {
		return this.containers.get(this.config.current.container);
	}
	/**
	 * A getter for the current overlay, specified in the config.
	 */
	get graphics() {
		return this.overlays.get(this.config.current.overlay);
	}

	/**
	 * This is the main render loop for the PixiJS renderer.
	 * Invoke this function to redraw the scene.
	 * 
	 * @param {number} dt - The time since the last frame in milliseconds.
	 */
	render(dt) {
		for(let [ name, overlay ] of this.overlays) {
			overlay.clear();
		}

		this.i = this.i || 0;
		this.i += 1;

		const { stage, graphics } = this;
		graphics.beginFill(0xFF0000);
		graphics.drawCircle(100 + Math.random() * 25, 100 + Math.random() * 25, 25);
		graphics.endFill();
		
		//TODO Probably add render hook manager here and iterate over them

		this.renderer.render(stage);
	}
};

export default Pixi;