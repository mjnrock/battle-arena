import Registry from "../Registry";

export class Environment extends Registry {
	constructor({ id, tags } = {}) {
		super({ id, tags });
	}
};

export default Environment;