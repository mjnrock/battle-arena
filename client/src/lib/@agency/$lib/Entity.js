import Registry from "./Registry";

export class Entity extends Registry {
	constructor (components = {}, { id, tags } = {}) {
		super([], { id, tags });

		//TODO register components
	}
}

export default Entity;