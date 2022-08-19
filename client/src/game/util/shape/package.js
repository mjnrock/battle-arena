import { Shape } from "./Shape";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";

export const Geometrix = {
	//* INTERSECTION
	circleIntersectsCircle: (c1, c2) => {
		const [ x1, y1, r1 ] = c1.pos();
		const [ x2, y2, r2 ] = c2.pos();

		return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) <= r1 + r2;
	},
	circleIntersectsRectangle: (c, r) => {
		const [ x, y, r1 ] = c.pos();
		const [ x0, y0, w, h ] = r.pos();

		return Math.sqrt((x - x0) ** 2 + (y - y0) ** 2) <= r1 || Math.sqrt((x - x0 - w) ** 2 + (y - y0) ** 2) <= r1 || Math.sqrt((x - x0 - w) ** 2 + (y - y0 - h) ** 2) <= r1 || Math.sqrt((x - x0) ** 2 + (y - y0 - h) ** 2) <= r1;
	},
	rectangleIntersectsRectangle: (r1, r2) => {
		const [ x0, y0, w, h ] = r1.pos();
		const [ x1, y1, w1, h1 ] = r2.pos();

		return x0 + w >= x1 && x0 <= x1 + w1 && y0 + h >= y1 && y0 <= y1 + h1;
	},
	
	//* DISTANCE
	distance: (s1, s2, manhattan = false) => {
		const [ x1, y1 ] = s1.pos();
		const [ x2, y2 ] = s2.pos();

		if(manhattan) {
			return Math.abs(x1 - x2) + Math.abs(y1 - y2);
		}

		return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
	},
	distanceToPoint: (s, x, y, manhattan = false) => {
		const [ x1, y1 ] = s.pos();

		if(manhattan) {
			return Math.abs(x1 - x) + Math.abs(y1 - y);
		}

		return Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
	},
	
	//* CONTAINMENT
	isPointWithinCircle: (c, x, y) => {
		const [ x1, y1, r1 ] = c.pos();

		return Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2) <= r1;
	},
	isPointWithinRectangle: (r, x, y) => {
		const [ x0, y0, w, h ] = r.pos();

		return x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h;
	},
};

export default {
	Shape,
	Circle,
	Rectangle,
};