import Registry from "../Registry";

export class Entity extends Registry {
	constructor (components = [], { id, tags } = {}) {
		super(components, { id, tags });
	}
};

export default Entity;