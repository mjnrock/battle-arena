import Layer from "./Layer";

/**
 * The View is responsible for actually invoking the rendering
 * that will be performed by its child Layers.
 * 
 * NOTE: All position information is pixel-based.
 */
export class View extends Layer {
	constructor ({ perspective, layers = [], container, render, view, mount, ...opts } = {}) {
		super({ container, render, ...opts });

		this.perspective = perspective;

		this.layers = new Map();
		this.view = [];

		this.addLayerObject(layers);

		if(view) {
			this.view = view;
		}

		if(mount) {
			this.mount(mount);
		}
	}

	getLayer(key, getContainer = false) {
		let layer = this.layers.get(key);
		if(layer && getContainer) {
			return layer.container;
		}

		return layer;
	}

	resetView() {
		this.view = Array.from(this.layers.keys());
	}

	addLayer(key, layer) {
		this.layers.set(key, layer);
		layer.mount(this.container);

		return this;
	}
	addLayerObject(obj) {
		let iter;
		if(Array.isArray(obj)) {
			iter = obj;
		} else if(typeof obj === "object") {
			iter = Object.entries(obj);
		}

		iter.forEach(([ key, layer ]) => {
			this.addLayer(key, layer);
		});

		this.resetView();

		return this;
	}
	removeLayer(key) {
		let layer = this.layers.get(key);

		if(layer) {
			layer.unmount(this.container);

			return this.layers.delete(key);
		}

		return false;
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

		this.view.forEach(key => {
			let layer = this.layers.get(key);

			if(layer) {
				layer.render(this.perspective, { dt, ...rest });
			}
		});
	}
};

export default Layer;