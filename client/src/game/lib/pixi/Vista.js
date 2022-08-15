import Identity from "../Identity";

/**
 * The Vista is a "camera" or "perspective" that expects to look at some direct state
 * object (e.g. Game, World) and create a boundary that a View can use to render a
 * more specific subset of the state (e.g. the immediate area around the player).
 */
export class Vista extends Identity {
	constructor ({ ref, x, y, w, h, scale = 1.0, subject, ...opts } = {}) {
		super({ ...opts });

		/**
		 * This would typically be the World or Game, depending on the context
		 */
		this.ref = ref;

		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;

		this.scale = scale;

		this.subject = subject;
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
};

export default Vista;