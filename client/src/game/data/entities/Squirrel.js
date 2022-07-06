import Entity from "./../../lib/@agency/lib/ecs/Entity";

export class Squirrel extends Entity {
	constructor(components = [], { id, tags } = {}) {
		super(components, { id, tags });

		//TODO Add Components
	}
};

export default Squirrel;