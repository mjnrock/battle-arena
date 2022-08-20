import Identity from "../Identity";

export class Shape extends Identity {
	constructor({ x, y, theta, ...opts } = {}) {
		super({ ...opts });

		/**
		 * The (relative) x position of the shape
		 */
		this.x = x;

		/**
		 * The (relative) y position of the shape
		 */
		this.y = y;

		/**
		 * The yaw of the shape, in degrees
		 */
		this.theta = theta || 0;
	}

	/**
	 * A convenience method to get the absolute position of the shape,
	 * along with relevant details for descendent shapes.
	 */
	pos(x0 = 0, y0 = 0) {
		return [
			x0 + this.x,
			y0 + this.y,
		];
	}

	/**
	 * Get .theta in degrees, plus an optional rotation
	 */
	toDegrees(rot = 0, isDegrees = true) {
		if(isDegrees) {
			return this.theta + rot;
		}

		return this.theta + rot * 180 / Math.PI;
	}
	/**
	 * Get .theta in radians, plus an optional rotation
	 */
	toRadians(rot = 0, isDegrees = true) {
		if(isDegrees) {
			return (this.theta * Math.PI / 180) + rot;
		}

		return (this.theta + rot) * Math.PI / 180;
	}

	static Create(...args) {
		return new this(...args);
	}
	static Factory(qty = 1, { each, args } = []) {
		let shapes = [];
		for(let i = 0; i < qty; i++) {
			let shape;

			if(typeof args === "function") {
				shape = new this(...args(i));
			} else {
				shape = new this(...args);
			}

			if(typeof each === "function") {
				each(shape, i);
			}

			shapes.push(shape);
		}

		return shapes;
	}
};

export default Shape;