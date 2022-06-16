import { v4 as uuid } from "uuid";

import Identity from "./Identity";

export class Component extends Identity {
	constructor ({ name, state = {}, id, tags } = {}) {
		super({ id, tags });

		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: name,
		});
		Reflect.defineProperty(this, "_args", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: {
				name,
				state,
				id,
				tags,
			},
		});

		Component.Upsert(this, state);
	}

	next(state, { id, tags } = {}) {
		return Component.Next(this, state, { id, tags });
	}
	delta(state = {}, { id, tags } = {}) {
		return Component.Delta(this, {
			...this,
			...state,
		}, { id, tags });
	}

	[ Symbol.iterator ]() {
		return Object.entries(this)[ Symbol.iterator ]();
	}

	static Create(name, state = {}, opts = {}) {
		return new this(name, state, opts);
	}

	/**
	 * Load all properties from the @state into the Component, as long as the
	 * property is writable.
	 */
	static Upsert(self, state = {}) {
		for(let key in state) {
			const attributes = Object.getOwnPropertyDescriptor(self, key);
			if(!attributes || (attributes && attributes.writable)) {
				self[ key ] = state[ key ];
			}
		}

		return self;
	}
	static Copy(self, { id = true, tags } = {}) {
		return self.next(self._args.state, { id, tags });
	}

	static Next(self, state, { id, tags } = {}) {
		let newId = id || self.id,
			newTags = tags || self.tags;

		if(id === true) {
			newId = uuid();
		}
		if(tags === true) {
			newTags = new Set();
		}

		return new self.constructor(self.name, state || self, { id: newId, tags: newTags });
	}
	static Delta(self, state, { id, tags } = {}) {
		let newId = id || self.id,
			newTags = tags || self.tags;

		if(id === true) {
			newId = uuid();
		}
		if(tags === true) {
			newTags = new Set();
		}

		return new self.constructor(self.name, {
			...self,
			...state,
		}, { id: newId, tags: newTags });
	}
}

export default Component;