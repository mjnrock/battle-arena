import Entity from "../../../@agency/core/ecs/Entity";
import System from "../../../@agency/core/ecs/System";

import StructPosition from "../struct/Physics";


export class Physics extends System {
	static Nomen = StructPosition.Nomen;
	
	static $(...entities) {
		return super.$(StructPosition.Nomen, ...entities);
	}
	$(...entities) {
		return super.$(StructPosition.Nomen, ...entities);
	}
	
	constructor() {
		super(StructPosition.Nomen);
	}

	move(comp, x, y, z, asDelta = false) {
		if(comp instanceof Entity) {
			const entity = comp;
			
			return this.move(entity.comp(this.nomen), x, y, z, asDelta);
		}
			
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

		return this;
	}
};

System.Registry.set(StructPosition.Nomen, new Physics());

export default Physics;