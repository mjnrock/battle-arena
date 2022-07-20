import Point from "./Point";

export class Circle extends Point {
	constructor ({ x, y, r, radius } = {}) {
		super({ x, y });

		this.radius = r || radius;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
			radius: this.radius,
		};
	}
	toArray() {
		return [ this.x, this.y, this.radius ];
	}

	static FromObject(obj) {
		return new Circle({
			x: obj.x,
			y: obj.y,
			radius: obj.r || obj.radius,
		});
	}
	static FromArray(arr) {
		return new Circle({
			x: arr[ 0 ],
			y: arr[ 1 ],
			radius: arr[ 2 ],
		});
	}
};

export default Circle;