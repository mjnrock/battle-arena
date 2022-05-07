import Struct from "../../../@agency/core/ecs/Struct";

export class Position extends Struct {
	constructor() {
		super({
			x: 0,
			y: 0,
			z: 0,
		});
	}

	pos(asObject = false) {
		if(asObject) {
			return {
				x: this.x,
				y: this.y,
				z: this.z,
			};
		}

		return [
			this.x,
			this.y,
			this.z,
		];
	}
};

export default Position;