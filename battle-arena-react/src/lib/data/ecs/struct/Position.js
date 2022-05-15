import Struct from "../../../@agency/core/ecs/Struct";

export class Position extends Struct {
	static Nomen = "position";
	
	constructor(state = {}, opts = {}) {
		super({
			world: null,

			x: 0,
			y: 0,
			z: 0,
			vx: 0,
			vy: 0,
			vz: 0,
			ax: 0,
			ay: 0,
			az: 0,

			pitch: 0,
			yaw: 0,
			rotation: 0,
			
			facing: 0,
			speed: 2.5,
			range: 10,

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