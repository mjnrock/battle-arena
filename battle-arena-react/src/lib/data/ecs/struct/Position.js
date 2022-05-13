import Struct from "../../../@agency/core/ecs/Struct";

export class Position extends Struct {
	static Nomen = "position";
	
	constructor(state = {}, opts = {}) {
		super({
			x: 0,
			y: 0,
			z: 0,

			...state,
		}, opts);
	}

	get pos() {
		return [
			this.x,
			this.y,
			this.z,
		];
	}	
	get posObj() {
		return {
			x: this.x,
			y: this.y,
			z: this.z,
		};
	}
	set pos(input = []) {
		if(Array.isArray(input)) {
			const [ x, y, z ] = input;
			
			this.x = x;
			this.y = y;
			this.z = z;
		} else if(typeof input === "object") {
			const { x, y, z } = input;
			
			this.x = x;
			this.y = y;
			this.z = z;
		}

		return this;
	}
};

export default Position;