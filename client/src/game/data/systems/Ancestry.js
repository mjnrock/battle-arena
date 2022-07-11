import System from "../../lib/ecs/System";
import { Name as CompName } from "../components/Ancestry";

export class Ancestry extends System {
	constructor ({ handlers = {} } = {}) {
		super({ name: CompName });

		this.handlers.addHandlers({
			parent: this.parent.bind(this),

			...handlers,
		});
	}

	//#region Events
	
	//#endregion Events
};

export default Ancestry;