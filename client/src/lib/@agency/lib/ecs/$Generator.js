import Factory from "../Factory";

//TODO Create an ECS-specialized Factory (i.e. Generator)
export class Generator extends Factory {
	constructor(species, args = [], { each, name, meta = {}, id, tags } = {}) {
		super();
	}
};

export default Generator;