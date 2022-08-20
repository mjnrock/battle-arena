import * as PIXI from "pixi.js";

import { Identity } from "../../util/Identity";
import { Perspective } from "./Perspective";

/**
 * While Pixi aims to mount the PIXI application and handle all DOM-related
 * tasks, the ViewPort is the (whole or subset) area that may be utilized.
 * You can think of Pixi as the entire << window >>, and the ViewPort as the
 * the portion of the window that may be rendered upon (it may also be the
 * entire window, but does not have to be).
 * 
 * NOTE: All position information is pixel-based.
 */
export class ViewPort extends Identity {
	constructor ({ x, y, width, height, views, container, mount, ref, ...opts } = {}) {
		super({ ...opts });

		/**
		 * The PIXI.Container that will be used as the root for all rendering
		 */
		this.container = container || new PIXI.Graphics();

		/**
		 * The clipping object that will be used to clip the rendering area
		 */
		this.setPerspective({ ref, x, y, width, height });

		/**
		 * All child-views that can be rendered -- get with .current, set internally in the View<Collection>
		 */
		this.setViews(views);

		/**
		 * Mount the ViewPort to the passed Pixi parent
		 */
		if(mount) {
			this.mount(mount);
		}
	}

	setPerspective({ ref, x, y, width, height } = {}) {
		this.perspective = new Perspective({
			ref,
			x,
			y,
			width,
			height,
		});

		this.container.x = x;
		this.container.y = y;
	}

	setViews(views) {
		this.container.removeChildren();

		this.views = views;
		this.container.addChild(this.views.current.container);
	}

	/**
	 * By default, get the requested layer from the current view.
	 * If @view is a string, get the layer from that view.
	 */
	getLayer(key, getContainer = false, view) {
		if(typeof view === "string") {
			return this.views.get(view).getLayer(key, getContainer);
		}

		return this.views.current.getLayer(key, getContainer);
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
	 * This will simply iterate all visible child-layers and 
	 * invoke their respective .render methods.
	 * While you can override this, typically you won't have to,
	 * unless you need more complex rendering logic than an
	 * ordered layer list.
	 */
	render({ dt, ...rest } = {}) {
		this.container.clear();

		//TODO Perform the clipping and alignment rendering here on Pixi

		this.views.current.render(this.perspective, { dt, ...rest });
	}
};

export default ViewPort;