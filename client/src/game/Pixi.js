import { Runner } from "matter-js";
import * as PixiJS from "pixi.js";

import MouseController from "./lib/input/MouseController";

/**
 * This is the main render wrapper class.  All rendering should be done through this class,
 * loading assets, creating sprites, and rendering the scene.  The asset loader is also present,
 * and should be the single source of truth for loaded assets.  This class does NOT contain
 * a game loop, but instead relies on external invocation of the .render method.
 */
export class Pixi {
	constructor ({ width, height, hooks = [] } = {}) {
		this.config = {
			width: width || window.innerWidth,
			height: height || window.innerHeight,
			current: {
				container: "default",
				overlay: "default",
			},
			mouse: null,
			context: {
				current: null,
				type: null,
			},
			isFullscreen: false,
		};

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

		/**
		 * The default loader for PixiJS, store all of the assets in memory here.
		 */
		this.loader = new PixiJS.Loader();

		/**
		 * Add any render hooks, such as graphics drawing operations.
		 */
		this.hooks = new Set(hooks);

		/**
		 * A container to hold any objects that need to be updated on the main render loop.
		 * Anything added to this *must* contain a .render method.  If you pass a function,
		 * it will be wrapped in an object and assigned to the "render" key, returning the 
		 * newly created object for proper cleanup, when needed.
		 * 
		 * NOTE: This fires after the hooks, but before the main render call.
		 */
		this.dependents = new PixiJS.Runner("render");
		const _add = this.dependents.add;
		this.dependents.add = function(input) {
			if(typeof input === "function") {
				input = {
					render: input,
				};
			}
			
			_add.call(this, input);

			return input;
		};

		/**
		 * A ticker that can be used to invoke the render loop using 
		 * requestAnimationFrame.
		 */
		this.ticker = new PixiJS.Ticker();


		//TODO Load textures with this.loader, map them to Entities; add/remove them to the stage, as appropriate
	
		//TODO Add a resize event listener to the window

		this.init();
	}

	init() {
		PixiJS.Ticker.shared.stop();

		/**
		 * Since this is not the intended way to invoke the render cycles,
		 * you must manually start the ticker again if you want to use it
		 * as the main render loop.
		 */
		this.ticker.add(this.render.bind(this));
		this.ticker.stop();

		this.containers.set("default", new PixiJS.Container());
		this.addOverlay("default");

		this.stage.addChild(this.graphics);

		this.config.mouse = new MouseController({
			element: this.canvas,
		});

		window.addEventListener("resize", this.resizeToViewport.bind(this));
		this.resizeToViewport();

		this.getContextType(true);

		return this;
	}

	get size() {
		return [
			this.config.width,
			this.config.height,
		];
	}
	resize(width, height) {
		this.config.width = width;
		this.config.height = height;

		this.renderer.resize(width, height);

		return this;
	}
	resizeToViewport() {
		return this.resize(window.innerWidth, window.innerHeight);
	}

	/**
	 * The canvas of the renderer.
	 */
	get canvas() {
		return this.renderer.view;
	}
	get ctx() {
		return this.config.context.current;
	}
	getContextType(reassign = false) {
		let type = null;

		if(this.canvas.getContext("webgl2")) {
			type = "webgl2";
		} else if(this.canvas.getContext("webgl")) {
			type = "webgl";
		} else if(this.canvas.getContext("2d")) {
			type = "2d";
		}

		if(reassign && type) {
			this.config.context.type = type;
			this.config.context.current = this.canvas.getContext(type);
		}
		
		return type;
	}

	/**
	 * A getter for the current container, specified in the config.
	 */
	get stage() {
		return this.containers.get(this.config.current.container);
	}

	addContainer(name, container) {
		container = container || new PixiJS.Container();

		this.containers.set(name, container);

		return container;
	}
	removeContainer(name) {
		const container = this.containers.get(name);
		
		if(container) {
			return this.containers.delete(name);
		}

		return false;
	}
	useContainer(name) {
		this.config.current.container = name;

		return this;
	}
	
	/**
	 * A getter for the current overlay, specified in the config.
	 */
	get graphics() {
		return this.overlays.get(this.config.current.overlay);
	}

	addOverlay(name, overlay) {
		overlay = overlay || new PixiJS.Graphics();

		this.overlays.set(name, overlay);

		this.stage.addChild(overlay);

		return overlay;
	}
	removeOverlay(name) {
		const overlay = this.overlays.get(name);
		
		if(overlay) {
			this.stage.removeChild(overlay);

			return this.overlays.delete(name);
		}

		return false;
	}
	useOverlay(name) {
		this.config.current.overlay = name;

		return this;
	}


	/**
	 * This is the main render loop for the PixiJS renderer.
	 * Invoke this function to redraw the scene.
	 * 
	 * @param {number} dt - The time since the last frame in milliseconds.
	 */
	render(dt) {
		this.graphics.clear();
		
		this.hooks.forEach(hook => hook(dt, this));
		this.dependents.run(dt, this);

		this.renderer.render(this.stage);
	}

	start() {
		this.ticker.start();

		return this;
	}
	stop() {
		this.ticker.stop();

		return this;
	}
};

export default Pixi;