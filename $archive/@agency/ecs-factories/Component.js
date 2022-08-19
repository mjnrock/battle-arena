import { singleOrArrayArgs } from "../util/helper";

import Identity from "./Identity";

/**
 * All properties beginning with a $ are functional methods that
 * will return a new instance of this.constructor.
 */
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


	next(...args) {
		return this;
	}
	delta(state = {}, ...args) {
		this.upsert(state);
		
		return this;
	}


	/**
	 * A set-like operation that will return a new component
	 * using *no pre-defined state*, except for the meta-properties
	 * of the component -- name, id, tags.  All final properties
	 * of the component will be driven from @state and the constructor.
	 */
	$next(state = {}, { name, id, tags } = {}) {
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
	/**
	 * A merge-like operation that will return a new component
	 * using the current component's state as the baseline, 
	 * overwriting any conflicts with the properties in @state.
	 */
	$delta(state = {}, { name, id, tags } = {}) {
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
	/**
	 * Copy the component in its initially-seeded state
	 */
	$recreate() {
		return new this.constructor(this._args);
	}
	/**
	 * Copy the component in its current state
	 */
	$copy() {
		return new this.constructor({
			state: this,
			name: this.name,
			tags: this.tags,
		});
	}
};

export default Component;