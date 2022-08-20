import Identity from "../../util/Identity";

//STUB: This is only partially complete

export class Point extends Identity {
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
};

export default Point;