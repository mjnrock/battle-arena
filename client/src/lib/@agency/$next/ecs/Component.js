import AgencyBase from "./../AgencyBase";

export class Component extends AgencyBase {
	constructor (name, state = {}, { id, tags, enumerableId = false, enumerableName = true } = {}) {
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

		for(let entry of this) {
			console.log(333, this.id, entry);
		}
	}

	[ Symbol.iterator ]() {
		return Object.entries(this)[ Symbol.iterator ]();
	}


	next(state, opts = {}) {
		return new this.constructor(this.name, state || this, { id: this.id, tags: this.tags, ...opts });
	}
	delta(state, opts = {}) {
		return new this.constructor(this.name, {
			...this,
			...state,
		}, { id: this.id, tags: this.tags, ...opts });
	}
};

export default Component;