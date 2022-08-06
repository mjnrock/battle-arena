import Matter from "matter-js";

import System from "../../lib/ecs/System";
import { Name as CompName } from "../components/Position";

export class Position extends System {
	static Name = CompName;
	constructor ({ handlers = {} } = {}) {
		super({ name: CompName });

		this.handlers.addHandlers({
			move: this.move.bind(this),
			
			...handlers,
		});
	}
	
	//#region Events
	move({ entities, data }) {
		for(let entity of entities) {
			const pos = this.get(entity);

			if(pos) {
				const { x, y, isDelta } = data;

				if(isDelta) {
					this.set(entity, Matter.Vector.add(pos, Matter.Vector.create(x, y)));
				} else {
					this.set(entity, Matter.Vector.create(x, y));
				}
			}
		}
	}

	//#endregion Events
};

export default Position;