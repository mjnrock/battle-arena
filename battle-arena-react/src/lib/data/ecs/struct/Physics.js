import Struct from "../../../@agency/core/ecs/Struct";
import { Bodies } from "matter-js";

export class Physics extends Struct {
	static Nomen = "physics";
	
	constructor(state = {}, opts = {}) {
		super({
			world: null,
			
			body: Bodies.circle(0, 0, 1),
			speed: 2.5,
			range: 10,

			...state,
		}, opts);
	}
};

export default Physics;