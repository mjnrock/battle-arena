import System from "../../lib/ecs/System";
import { Name as CompName } from "../components/Physics";

export class Physics extends System {
	constructor ({ handlers = {} } = {}) {
		super({ name: CompName });

		this.handlers.addHandlers({
			update: this.update.bind(this),

			...handlers,
		});
	}

	//#region Events
	update({ entities, data }) {
		for(let entity of entities) {
			const phys = this.get(entity);

			if(phys) {
				const { dt } = data;
				const { engine } = phys;

				Matter.Engine.update(engine, dt * 1000, 1);
			}
		}
	}
	//#endregion Events
};

export default Physics;