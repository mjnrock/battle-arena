import Registry from "../Registry";

export class Entity extends Registry {
	constructor (components = {}, { id, tags } = {}) {
		super([], { id, tags });

		this.register(components);
	}

	static Factory(qty = 1, components = {}, { id, tags, $eval = false, ...rest } = {}) {
		if($eval) {
			for(let [ name, input ] of Object.entries(components)) {
				if(typeof input === "function") {
					components[ name ] = input();
				} else {
					components[ name ] = input;
				}
			}
		}

		return new Array(qty).fill(0).map(() => new this(components, { id, tags, ...rest }));
	}
};

export default Entity;