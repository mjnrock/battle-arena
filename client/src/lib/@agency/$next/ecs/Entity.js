import Registry from "../Registry";

export class Entity extends Registry {
	constructor (components = [], { id, tags } = {}) {
		super([], { id, tags });

		this.register(components);
	}

	register(components = {}) {
		if(Array.isArray(components)) {
			for(let key in components) {
				const comp = components[ key ];
				
				const uuid = this.add(comp);
				this.addAlias(uuid, comp.__name);
			}
		} else if(typeof components === "object") {
			for(let key in components) {
				const comp = components[ key ];
				
				const uuid = this.add(comp);
				this.addAlias(uuid, key);
				this.addAlias(uuid, comp.__name);
			}
		}

		return this;
	}
};

export default Entity;