import AgencyBase from "./../AgencyBase";

export class Component extends AgencyBase {
	constructor (name, state = {}, { id, tags, enumerableId = false, enumerableName = false } = {}) {
		super({ id, tags });

		Reflect.defineProperty(this, "id", {
			enumerable: enumerableId,
			configurable: true,
			writable: true,
			value: this.id,
		});
		Reflect.defineProperty(this, "name", {
			enumerable: enumerableName,
			configurable: true,
			writable: true,
			value: name,
		});
		
		for(let key in state) {
			this[ key ] = state[ key ];
		}

		if(!this.name) {
			throw new Error("Component must have a name.");
		}
	}

	next(state, ...args) {
		return new this.constructor(this.name, state || this);
	}
	delta(state, ...args) {
		return new this.constructor(this.name, {
			...this,
			...state,
		});
	}
};

export default Component;