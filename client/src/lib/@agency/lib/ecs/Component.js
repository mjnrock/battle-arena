import Identity from "../Identity";

/**
 * The Component is a low-level wrapper structure used to store data in the
 * Entity.
 */
export class Component extends Identity {
	constructor (name, state = {}, { id, tags } = {}) {
		super({ id: state.id || id, tags: state.tags || tags });

		/**
		 * Remove the enumerability of .name, but retain the configurable property
		 * so that it can be changed, if desired.
		 */
		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: true,
			writable: true,
			value: name,
		});

		/**
		 * Load all properties from the state into the Component, so long as the
		 * property is writable.
		 */
		for(let key in state) {
			const attributes = Object.getOwnPropertyDescriptor(this, key);
			if(!attributes || (attributes && attributes.writable)) {
				this[ key ] = state[ key ];
			}
		}

		/**
		 * A Component must have a name.
		 */
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

	static Create(name, state = {}, opts = {}) {
		return new this(name, state, opts);
	}
};

export default Component;