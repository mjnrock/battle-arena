import Entity from "../../../@agency/core/ecs/Entity";
import System from "../../../@agency/core/ecs/System";
import PositionComp from "./../component/Position";

export class Position extends System {
	static Instances = new Map([
		[ "default", new Position() ],
	]);
	
	static get $() {
		const instance = this.Instances.get("default");
		
		return instance.trigger.bind(instance);
	}

	constructor({} = {}) {
		super(PositionComp.Nomen, PositionComp);
	}


	move(entityOrComp, x, y, z, asDelta = false) {
		if(entityOrComp instanceof this.template) {
			if(asDelta) {
				entityOrComp.pos = [
					entityOrComp.x + x,
					entityOrComp.y + y,
					entityOrComp.z + z,
				];
			} else {
				entityOrComp.pos = [
					x,
					y,
					z,
				];
			}
		} else if(entityOrComp instanceof Entity) {
			this.move(entityOrComp.comp(this.nomen), x, y, z, asDelta);
		}

		return this;
	}
};

export default Position;