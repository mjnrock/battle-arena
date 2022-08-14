import Identity from "../Identity";

export class Camera extends Identity {
	constructor ({ ref, x, y, w, h, zoom = 1.0, subject, ...opts } = {}) {
		super({ ...opts });

		this.ref = ref;

		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;

		this.zoom = zoom;

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

export default Camera;