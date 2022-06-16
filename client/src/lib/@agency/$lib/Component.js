import { v4 as uuid } from "uuid";

import Identity from "./Identity";

export class Component extends Identity {
	constructor (name, state = {}, { id, tags } = {}) {
		super({ id, tags });

		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: name,
		});

		/**
		 * Load all properties from the @state into the Component, as long as the
		 * property is writable.
		 */
		for(let key in state) {
			const attributes = Object.getOwnPropertyDescriptor(this, key);
			if(!attributes || (attributes && attributes.writable)) {
				this[ key ] = state[ key ];
			}
		}
	}

	[ Symbol.iterator ]() {
		return Object.entries(this)[ Symbol.iterator ]();
	}
	next(state, { id, tags } = {}) {
		let newId = id || this.id,
			newTags = tags || this.tags;

		if(id === true) {
			newId = uuid();
		}
		if(tags === true) {
			newTags = new Set();
		}

		return new this.constructor(this.name, state || this, { id: newId, tags: newTags });
	}
	delta(state, { id, tags } = {}) {
		let newId = id || this.id,
			newTags = tags || this.tags;

		if(id === true) {
			newId = uuid();
		}
		if(tags === true) {
			newTags = new Set();
		}

		return new this.constructor(this.name, {
			...this,
			...state,
		}, { id: newId, tags: newTags });
	}

	static Create(name, state = {}, opts = {}) {
		return new this(name, state, opts);
	}
}

export default Component;