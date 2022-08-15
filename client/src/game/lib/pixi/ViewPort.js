import { Identity } from "../Identity";

/**
 * While Pixi aims to mount the PIXI application and handle all DOM-related
 * tasks, the ViewPort is the (whole or subset) area that may be utilized.
 * You can think of Pixi as the entire << window >>, and the ViewPort as the
 * the portion of the window that may be rendered upon (it may also be the
 * entire window, but does not have to be).
 */
export class ViewPort extends Identity {
	constructor ({ view, container, ...opts } = {}) {
		super({ ...opts });

		this.container = container || new PIXI.Graphics();
		this.view = view;

		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;

		if(mount) {
			this.mount(mount);
		}
	}

	viewport(asObject = false) {
		let { x, y, width, height } = this;
		if(asObject) {
			return {
				x,
				y,
				width,
				height,
			};
		}

		return [ x, y, width, height ];
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
		
		this.view.render({ dt, ...rest });
	}
};

export default Layer;