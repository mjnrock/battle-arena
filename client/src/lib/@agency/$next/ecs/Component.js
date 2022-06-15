import AgencyBase from "./../AgencyBase";

export class Component extends AgencyBase {
	constructor (name, state = {}, { id, tags } = {}) {
		super({ id: state.id || id, tags: state.tags || tags });

		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: true,
			writable: true,
			value: name,
		});

		for(let key in state) {
			const attributes = Object.getOwnPropertyDescriptor(this, key);
			if(!attributes || (attributes && attributes.writable)) {
				this[ key ] = state[ key ];
			}
		}

		if(!this.name) {
			throw new Error("Component must have a name.");
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