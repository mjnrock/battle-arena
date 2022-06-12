import Entity from "../../lib/@agency/core/ecs/Entity";
import ComponentPosition from "./../components/Position";

export class Squirrel extends Entity {
	constructor() {
		// super(components = [], { parent, children = [], agencyBase = {} } = {})
		super();

		this.registerManyWithAlias({
			position: ComponentPosition(0, 0),
		});
	}
};

export default Squirrel;