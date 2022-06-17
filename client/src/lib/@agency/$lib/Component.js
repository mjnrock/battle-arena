import { singleOrArrayArgs } from "../util/helper";

import Identity from "./Identity";

export class Component extends Identity {
	static ParseOpts(self, { name, id, tags } = {}) {
		return {
			name: Identity.Comparators.IsStringOrSymbol(name) ? name : self.name,
			id: Identity.Comparators.IsStringOrSymbol(id) ? id : self.id,
			tags: tags ? singleOrArrayArgs(tags) : self.tags,
		};
	};

	constructor ({ name, state = {}, id, tags, ...rest } = {}) {
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
				...arguments[ 0 ],
			},
		});

		this.upsert(state);
	}

	[ Symbol.iterator ]() {
		return Object.entries(this)[ Symbol.iterator ]();
	}

	upsert(state = {}) {
		for(let key in state) {
			if(key === "id" || key === "tags") {
				continue;
			}

			const attributes = Object.getOwnPropertyDescriptor(this, key);
			if(!attributes || (attributes && attributes.writable)) {
				this[ key ] = state[ key ];
			}
		}
		
		return this;
	}

	next(state = {}, { name, id, tags } = {}) {
		const comp = new this.constructor({
			...state,
			...this.constructor.ParseOpts(this, {
				name: name || this.name,
				id: id || this.id,
				tags: tags || this.tags,
			}),
		});

		return comp;
	}
	delta(state = {}, { name, id, tags } = {}) {
		const comp = new this.constructor({
			...this,
			...state,
			...this.constructor.ParseOpts(this, {
				name: name || this.name,
				id: id || this.id,
				tags: tags || this.tags,
			}),
		});

		return comp;
	}


	recreate() {
		return new this.constructor(this._args);
	}
	copy(compArgPos = 0) {
		return new this.constructor({
			state: this,
			name: this.name,
			tags: this.tags,
		});
	}
};

export default Component;