import System from "../../lib/ecs/System";
import { Name as CompName } from "../components/Position";

export class Position extends System {
	constructor ({ handlers = {} } = {}) {
		super();

		this.handlers.addHandlers({
			move: this.move.bind(this),
			
			...handlers,
		});
	}

	//#region Helpers
	get(entity) {
		if(entity.has(CompName)) {
			return entity.get(CompName);
		}

		return false;
	}
	
	//#region Events
	move({ entities, data }) {
		for(let entity of entities) {
			const pos = this.get(entity);

			if(pos) {
				const { x, y, isDelta } = data;

				if(isDelta) {
					pos.x += x;
					pos.y += y;
				} else {
					pos.x = x;
					pos.y = y;
				}
			}
		}
	}

	//#endregion Events
};

export default Position;