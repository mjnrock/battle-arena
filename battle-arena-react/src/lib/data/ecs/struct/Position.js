import Struct from "../../../@agency/core/ecs/Struct";

export class Position extends Struct {
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
	set pos(value = []) {
		if(Array.isArray(value)) {
			const [ x, y, z ] = value;
			
			this.x = x;
			this.y = y;
			this.z = z;
		}

		return this;
	}
	
	get posObj() {
		return {
			x: this.x,
			y: this.y,
			z: this.z,
		};
	}
	set posObj(obj = {}) {
		const { x, y, z } = obj;
		
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	}
};

export default Position;