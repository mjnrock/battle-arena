import Shape from "./Shape";

export class Circle extends Shape {
	constructor ({ x, y, r, d, ...opts } = {}) {
		super({ x, y, ...opts });

		/**
		 * The radius of the circle
		 */
		r = r || d / 2;
		this.radius = r;
	}

	/**
	 * A convenience method to get the absolute position of the shape,
	 * along with relevant details for descendent shapes.
	 */
	pos(x0 = 0, y0 = 0) {
		return [
			x0 + this.x,
			y0 + this.y,
			this.radius,
		];
	}
	
	/**
	 * 
	 * @param {*} x The x point to compare
	 * @param {*} y The y point to compare
	 * @param {*} x0 The origin x point of this (if relative)
	 * @param {*} y0  The origin y point of this (if relative)
	 * @returns 
	 */
	isPointWithin(x, y, x0 = 0, y0 = 0) {
		const [ x1, y1 ] = this.pos(x0, y0);

		return Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2) <= this.radius;
	}
};

export default Circle;