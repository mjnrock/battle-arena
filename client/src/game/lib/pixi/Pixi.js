import * as PIXI from "pixi.js";

import Runner from "../../util/relay/Runner";

export const PixiJS = PIXI;

//TODO: Should probably make this relative to the DOM element's position, rather than the screen

/**
 * This is the main render wrapper class.  All rendering should be done through this class,
 * loading assets, creating sprites, and rendering the scene.  The asset loader is also present,
 * and should be the single source of truth for loaded assets.  This class does NOT contain
 * a game loop, but instead relies on external invocation of the .render method.
 * 
 * The entire chain of rendering should be: * 
 **		(1) Pixi -> (1*) View -> { (1) Perspective, (1+) Layers }
 * 
 * NOTE: All position information is pixel-based.
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

			/**
			 * Rendering cache objects
			 */
			lastRender: 0,
			isAnimating: false,
		};

		/**
		 * The default renderer for PixiJS, this is the main renderer for all screen drawing.
		 */
		this.renderer = new PixiJS.Renderer({
			width: this.config.width,
			height: this.config.height,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			antialias: true,
		});

		/**
		 * The main stage for the renderer.  All work should be done by manipulating
		 * the children of the stage using the Layer and View proxies. 
		 */
		this.stage = new PixiJS.Container();

		//TODO Load textures with this.loader, map them to Entities; add/remove them to the stage, as appropriate
		//TODO Move the resource manager to a separate class, but create a link between these for rendering
		/**
		 * The default loader for PixiJS, store all of the assets in memory here.
		 */
		this.loader = new PixiJS.Loader();

		/**
		 * A container to hold any objects that need to be updated by the main render loop.
		 * As this is a typed Runner, anything added to this *must* contain a .render method.
		 */
		this.observers = new Runner("render");
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
		self.stop();

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
	 * Get the current width and height as a tuple.
	 */
	get size() {
		return [
			this.canvas.width,
			this.canvas.height,
		];
	}
	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
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
	 * This is the main render loop for the PixiJS renderer.
	 * Invoke this function to redraw the scene.
	 * 
	 * @param {number} dt - The time since the last frame in milliseconds.
	 */
	render(dt) {
		const now = Date.now();

		this.observers.run({
			dt,
			now,
			pixi: this,
		});

		this.renderer.render(this.stage);

		this.config.lastRender = now;
	}

	/**
	 * Start the main render loop.
	 */
	start() {
		this.ticker.start();
		this.config.isAnimating = true;

		return this;
	}
	/**
	 * Stop the main render loop.
	 */
	stop() {
		this.ticker.stop();
		this.config.isAnimating = false;

		return this;
	}
	get isAnimating() {
		return this.config.isAnimating;
	}
};

//#region Extensions
PixiJS.Graphics.prototype.drawRing = function (w, h, cx = 0, cy = 0) {
	var lx = cx - w * 0.5;
	var rx = cx + w * 0.5;
	var ty = cy - h * 0.5;
	var by = cy + h * 0.5;

	var magic = 0.551915024494;
	var xmagic = magic * w * 0.5;
	var ymagic = h * magic * 0.5;

	this.moveTo(cx, ty);
	this.bezierCurveTo(cx + xmagic, ty, rx, cy - ymagic, rx, cy);
	this.bezierCurveTo(rx, cy + ymagic, cx + xmagic, by, cx, by);
	this.bezierCurveTo(cx - xmagic, by, lx, cy + ymagic, lx, cy);
	this.bezierCurveTo(lx, cy - ymagic, cx - xmagic, ty, cx, ty);

	return this;
};
//#endregion Extensions

export default Pixi;