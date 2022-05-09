import Entity from "../../../@agency/core/ecs/Entity";
import System from "../../../@agency/core/ecs/System";
import ComponentPosition from "./../component/Position";

export class Position extends System {
	static Instances = new Map([
		[ this.DefaultKey, new this() ],
	]);

	constructor() {
		super(ComponentPosition.Nomen, ComponentPosition);
	}

	move(input, x, y, z, asDelta = false) {
		if(input instanceof this.template) {
			const comp = input;
			
			if(asDelta) {
				comp.pos = [
					comp.x + x,
					comp.y + y,
					comp.z + z,
				];
			} else {
				comp.pos = [
					x,
					y,
					z,
				];
			}
		} else if(input instanceof Entity) {
			const entity = input;
			
			this.move(entity.comp(this.nomen), x, y, z, asDelta);
		}

		return this;
	}
};

export default Position;