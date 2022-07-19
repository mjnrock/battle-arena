import * as PixiJS from "pixi.js";

import MouseController from "./lib/input/MouseController";

/**
 * This is the main render wrapper class.  All rendering should be done through this class,
 * loading assets, creating sprites, and rendering the scene.  The asset loader is also present,
 * and should be the single source of truth for loaded assets.  This class does NOT contain
 * a game loop, but instead relies on external invocation of the .render method.
 */
export class Pixi {
	constructor ({ width, height, observers = [] } = {}) {
		/**
		 * The general configuration and internal cache storage.
		 */
		this.config = {
			/**
			 * Cache the width and height of the canvas.
			 */
			width: width || window.innerWidth,
			height: height || window.innerHeight,

			/**
			 * Store the current container and overlay from their respective Maps.
			 */
			current: {
				container: "default",
				overlay: "default",
			},

			/**
			 * This will contain the initialized MouseController.
			 * TODO: Generalize this to input controllers and refactor accordingly.
			 */
			mouse: null,

			/**
			 * Cache the canvas' context information
			 */
			context: {
				current: null,
				type: null,
			},

			/**
			 * A boolean to indicate whether or not the renderer leverage (and invoke) the Fullscreen API.
			 * TODO: Listen for the availability of the fullscreen API and invoke accordingly.
			 */
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
		 * This is a map of [ name, PIXI.Container ] entries.
		 */
		this.containers = new Map();

		/**
		 * These are PIXI.Graphics objects that are used to draw on the screen.
		 * This is a map of [ name, PIXI.Graphics ] entries.  When added, these
		 * will always be attached to the current container.
		 */
		this.overlays = new Map();

		//TODO Load textures with this.loader, map them to Entities; add/remove them to the stage, as appropriate
		//TODO Move the resource manager to a separate class, but create a link between these for rendering
		/**
		 * The default loader for PixiJS, store all of the assets in memory here.
		 */
		this.loader = new PixiJS.Loader();

		/**
		 * A container to hold any objects that need to be updated by the main render loop.
		 * As this is a PIXI.Runner, anything added to this *must* contain a .render method.
		 */
		this.observers = new PixiJS.Runner("render");
		for(let observer of observers) {
			this.observers.add(observer);
		}

		/**
		 * A ticker that can be used to invoke the render loop using 
		 * requestAnimationFrame.
		 */
		this.ticker = new PixiJS.Ticker();

		/**
		 * Initialize the renderer and modify, as needed.
		 */
		Pixi.Init(this);
	}

	/**
	 * A general initialization function that will be run on every new instance.
	 * Override this function to modify the initialization process.
	 */
	static Init(self) {
		/**
		 * Stop the shared ticker on Pixi and take over the rendering loop.
		 */
		PixiJS.Ticker.shared.stop();

		/**
		 * Since this is not the intended way to invoke the render cycles,
		 * you must manually start the ticker again if you want to use it
		 * as the main render loop.
		 */
		// self.config.renderListener = self.render.bind(self);
		self.config.renderListener = self.render.bind(self);
		self.ticker.add(self.config.renderListener);
		self.ticker.stop();

		/**
		 * Add a default stage (PIXI.Container) and graphics (PIXI.Graphics) to the renderer.
		 */
		self.addContainer("default");
		self.addOverlay("default");

		/**
		 * Bind the mouse controller to the canvas to take over mouse events.
		 */
		self.config.mouse = new MouseController({
			element: self.canvas,
		});

		/**
		 * Add a resize listener to the window and resize the renderer.
		 */
		self.config.resizeListener = self.resizeToViewport.bind(self);
		window.addEventListener("resize", self.config.resizeListener);
		self.resizeToViewport();

		/**
		 * Determine the current context type of the renderer and assign it to the config.
		 */
		self.getContextType(true);

		return self;
	}
	/**
	 * A generalized cleanup function for Pixi instances
	 */
	static Destroy(self) {
		self.ticker.stop();
		self.ticker.remove(self.config.renderListener);
		self.ticker.destroy();

		self.observers.destroy();

		self.renderer.destroy(true);

		window.removeEventListener("resize", self.config.resizeListener);
	}

	/**
	 * Invoke this to cleanup the Pixi instance.
	 */
	deconstructor() {
		Pixi.Destroy(this);
	}

	/**
	 * A convenience getter for the MouseController
	 */
	get mouse() {
		return this.config.mouse;
	}

	/**
	 * Get the current width and height as a tuple.
	 */
	get size() {
		return [
			this.config.width,
			this.config.height,
		];
	}
	/**
	 * Get the current bounds of the canvas.
	 */
	get bounds() {
		const canvas = this.canvas;

		return {
			x: canvas.offsetLeft,
			y: canvas.offsetTop,
			width: canvas.offsetWidth,
			height: canvas.offsetHeight,
		};
	}
	/**
	 * Resize the renderer to the specified width and height.
	 */
	resize(width, height) {
		this.config.width = width;
		this.config.height = height;

		this.renderer.resize(width, height);

		return this;
	}
	/**
	 * Resize the renderer to the current viewport, using innerWidth and innerHeight.
	 */
	resizeToViewport() {
		return this.resize(window.innerWidth, window.innerHeight);
	}

	/**
	 * The canvas of the renderer.
	 */
	get canvas() {
		return this.renderer.view;
	}
	/**
	 * A getter for the canvas' current context.
	 */
	get ctx() {
		return this.config.context.current;
	}
	/**
	 * Determine the current context type of the renderer.
	 */
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
	/**
	 * Add a new container to the registry, to be used as a stage.
	 */
	addContainer(name, container) {
		container = container || new PixiJS.Container();

		this.containers.set(name, container);

		return container;
	}
	/**
	 * Remove a container from the registry.
	 */
	removeContainer(name) {
		const container = this.containers.get(name);
		
		if(container) {
			return this.containers.delete(name);
		}

		return false;
	}
	/**
	 * Change the current stage to the specified name.
	 */
	useContainer(name = "default") {
		this.config.current.container = name;

		return this;
	}
	
	/**
	 * A getter for the current overlay, specified in the config.
	 */
	get graphics() {
		return this.overlays.get(this.config.current.overlay);
	}
	/**
	 * Add a new overlay to the registry, to be used as a graphics overlay.
	 */
	addOverlay(name, overlay) {
		overlay = overlay || new PixiJS.Graphics();

		this.overlays.set(name, overlay);

		this.stage.addChild(overlay);

		return overlay;
	}
	/**
	 * Remove an overlay from the registry.
	 */
	removeOverlay(name) {
		const overlay = this.overlays.get(name);
		
		if(overlay) {
			this.stage.removeChild(overlay);

			return this.overlays.delete(name);
		}

		return false;
	}
	/**
	 * Change the current overlay to the specified name.
	 */
	useOverlay(name = "default") {
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
		
		this.observers.run(dt, this);

		this.renderer.render(this.stage);
	}

	/**
	 * Start the main render loop.
	 */
	start() {
		this.ticker.start();

		return this;
	}
	/**
	 * Stop the main render loop.
	 */
	stop() {
		this.ticker.stop();

		return this;
	}
};

export default Pixi;