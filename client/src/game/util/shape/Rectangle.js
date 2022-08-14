import Shape from "./Shape";

export class Rectangle extends Shape {
	constructor ({ x, y, w, h, r, ...opts } = {}) {
		super({ x, y, ...opts });

		if(r) {
			this.width = r * 2;
			this.height = r * 2;
		} else {
			this.width = w;
			this.height = h;
		}
	}

	/**
	 * A convenience method to get the absolute position of the shape,
	 * along with relevant details for descendent shapes.
	 */
	pos(x0 = 0, y0 = 0) {
		return [
			x0 + this.x,
			y0 + this.y,
			this.width,
			this.height,
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

		return x >= x1 && x <= x1 + this.width && y >= y1 && y <= y1 + this.height;
	}
};

export default Rectangle;