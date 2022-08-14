import Shape from "./Shape";

//STUB: This is only partially complete

export class Polygon extends Shape {
	constructor ({ x, y, points = [], ...opts } = {}) {
		super({ x, y, ...opts });

		this.points = points;
		this.cache = {
			max: {
				x: -Infinity,
				y: -Infinity,
			},
			min: {
				x: Infinity,
				y: Infinity,
			},
		};

		this._updateCache();
	}

	_updateCache() {
		for(let [ x, y ] of this.points) {
			if(x > this.cache.max.x) {
				this.cache.max.x = x;
			}
			if(x < this.cache.min.x) {
				this.cache.min.x = x;
			}

			if(y > this.cache.max.y) {
				this.cache.max.y = y;
			}
			if(y < this.cache.min.y) {
				this.cache.min.y = y;
			}
		}
	}


	/**
	 * A convenience method to get the absolute position of the shape,
	 * along with relevant details for descendent shapes.
	 */
	pos(x0 = 0, y0 = 0) {
		let pos = [
			x0 + this.x,
			y0 + this.y,
		];

		for(let [ x, y ] of this.points) {
			pos.push(x, y);
		}

		return pos;
	}
};

export default Polygon;