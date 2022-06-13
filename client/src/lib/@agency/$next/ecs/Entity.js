import Registry from "../Registry";

export class Entity extends Registry {
	constructor({ id, tags } = {}) {
		super({ id, tags });
	}
};

export default Entity;