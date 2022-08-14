import * as PIXI from "pixi.js";

import Identity from "../Identity";

export class Layer extends Identity {
	constructor ({ container, render, ...opts } = {}) {
		super({ ...opts });

		this.container = container || new PIXI.Graphics();

		if(typeof render === "function") {
			this.render = render;
		}
	}

	/**
	 * Attach the .container to a PIXI.Container parent
	 */
	mount(parent) {
		parent.addChild(this.container);

		return this;
	}
	/**
	 * Detach the .container from its PIXI.Container parent
	 */
	unmount(parent) {
		parent.removeChild(this.container);

		return this;
	}

	/**
	 * ! This method should be overridden during instantiation
	 * The method that will be fired when a View is rendered,
	 * passing the invoking Camera.
	 */
	render(camera, { dt, ...rest } = {}) { }
};

export default Layer;