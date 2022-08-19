import Point from "./Point";

export class Rectangle extends Point {
	constructor ({ x, y, w, h, width, height } = {}) {
		super({ x, y });

		/**
		 * The width of the Rectangle.
		 */
		this.width = w || width;

		/**
		 * The height of the Rectangle.
		 * This will use @width if @height is null.
		 */
		this.height = (h || height) || (w || width);
	}

	/**
	 * A quick way to check if this Rectangle is also a Square.
	 */
	isSquare() {
		return this.width === this.height;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};
	}
	toArray() {
		return [ this.x, this.y, this.width, this.height ];
	}

	/**
	 * Create a Rectangle from a center point and radius/i.
	 * If @rh is null, @rw will be used to create a square.
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} rw 
	 * @param {?number} rh 
	 * @returns Rectangle
	 */
	static FromRadii(x, y, rw, rh) {
		if(rh == null) {
			rh = rw;
		}

		return new Rectangle({
			x: x - rw,
			y: y - rh,
			width: rw * 2,
			height: rh * 2,
		});
	}

	static FromObject(obj) {
		return new Rectangle({
			x: obj.x,
			y: obj.y,
			width: obj.w || obj.width,
			height: obj.h || obj.height,
		});
	}
	static FromArray(arr) {
		return new Rectangle({
			x: arr[ 0 ],
			y: arr[ 1 ],
			width: arr[ 2 ],
			height: arr[ 3 ],
		});
	}
};

export default Rectangle;