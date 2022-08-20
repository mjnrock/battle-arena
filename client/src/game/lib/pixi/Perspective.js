import Identiy from "../../util/Identity";

/**
 * The Perspective is a "View Constraint" that expects to look at some direct state
 * object (e.g. Game, World) and create a boundary that a View can use to render a
 * more specific subset of the state (e.g. the immediate area around the player).
 * 
 * NOTE: All position information is pixel-based.
 */
export class Perspective extends Identiy {
	constructor ({ ref, x, y, width, height, scale = 1.0, subject, ...opts } = {}) {
		super({ ...opts });

		/**
		 * This would ypically be the World or Game, depending on the context
		 */
		this.ref = ref;

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.scale = scale;

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

	/**
	 * Take a TILE POSITION and convert it to a PIXEL POSITION (@tw, @th) to test against the viewport constraints
	 */
	test(x, y) {
		if(typeof x === "object") {
			y = x.y;
			x = x.x;
		}
		
		let { x: vx, y: vy, width: vw, height: vh } = this.viewport(true);

		return x >= vx
			&& x < vx + vw
			&& y >= vy
			&& y < vy + vh;
	}
};

export default Perspective;