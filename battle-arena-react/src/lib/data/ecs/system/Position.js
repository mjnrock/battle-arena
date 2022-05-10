import Entity from "../../../@agency/core/ecs/Entity";
import System from "../../../@agency/core/ecs/System";


export class Position extends System {
	static Nomen = "position";
	
	constructor() {
		super(Position.Nomen);
	}

	//TODO Add middleware that performs the Entity:Component extraction

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

System.Registry.set(Position.Nomen, new Position());

export default Position;