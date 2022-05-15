import Entity from "../../../@agency/core/ecs/Entity";
import System from "../../../@agency/core/ecs/System";

import StructLocamotive from "../struct/Locamotive";


export class Locamotive extends System {
	static Nomen = StructLocamotive.Nomen;
	
	static $(...entities) {
		return super.$(StructLocamotive.Nomen, ...entities);
	}
	$(...entities) {
		return super.$(StructLocamotive.Nomen, ...entities);
	}
	
	constructor() {
		super(StructLocamotive.Nomen);
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

System.Registry.set(StructLocamotive.Nomen, new Locamotive());

export default Locamotive;