import Registry from "./$Registry";

export class Entity extends Registry {
	constructor (compArgs = {}) {
		super(compArgs);

		//TODO register components
	}
}

export default Entity;