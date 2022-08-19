import * as PIXI from "pixi.js";

import Identity from "../Identity";

/**
 * The Layer performs the actual rask of rendering data.  It will typically receive
 * its inputs from a parent-View, invoking the View's .render method which will typically
 * cascade to each of its child Layers.  The Layer expects to receive a Perspective object, which
 * will -- at a minimum -- contain any information necessary to dictate what qualifies to be
 * rendered.  While it expects a proper Perspective object, it is not required to receive one.
 * 
 * NOTE: All position information is pixel-based.
 */
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
	render(perspective, { dt, ...rest } = {}) { }
};

export default Layer;