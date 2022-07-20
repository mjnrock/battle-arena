export class Point {
	constructor ({ x, y } = {}) {
		this.x = x;
		this.y = y;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
		};
	}
	toArray() {
		return [ this.x, this.y ];
	}

	static FromObject(obj) {
		return new Point({
			x: obj.x,
			y: obj.y,
		});
	}
	static FromArray(arr) {
		return new Point({
			x: arr[ 0 ],
			y: arr[ 1 ],
		});
	}
};

export default Point;