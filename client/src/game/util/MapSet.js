/**
 * This is a Map that holds <key, Set> pairs.  Primarily, this is useful
 * for things like event subscriptions or the like, but can be generalized
 * to any kind of Map where the values should be stored in a Set.
 */
export class MapSet {
	constructor (entries = [], { destructure = true } = {}) {
		this._entries = new Map();

		this.addObject(entries, destructure);

		return new Proxy(this, {
			get(target, key) {
				return target[ key ];
			},
			set(target, key, value) {
				target[ key ] = value;
				
				return true;
			},
		});
	}

	/**
	 * Maps the Map<k, Set<v>> to an Array<[k, v[]]> iterable
	 */
	[ Symbol.iterator ]() {
		return Array.from(this._entries.entries()).map(([ key, set ]) => [ key, Array.from(set) ])[ Symbol.iterator ]();
	}

	addKey(key) {
		if(!this._entries.has(key)) {
			this._entries.set(key, new Set());
		}

		return this;
	}
	hasKey(key) {
		return this._entries.has(key);
	}
	deleteKey(key) {
		return this._entries.delete(key);
	}

	size(key) {
		if(key) {
			return this._entries.get(key).size;
		}

		return this._entries.size;
	}

	add(key, ...values) {
		this.addKey(key);

		const set = this._entries.get(key);
		values.forEach(value => {
			set.add(value);
		});

		return this;
	}
	/**
	 * This is a higher-level .add, which expects either an Array or an Object.
	 * 
	 * NOTE: values will be destructured by default if they are Iterables.
	 */
	addObject(obj, destructure = true) {
		let iter = [];
		if(Array.isArray(obj)) {
			iter = obj;
		} else if(typeof obj === "object") {
			iter = Object.entries(obj);
		}

		iter.forEach(([ key, values ]) => {
			if(destructure && typeof values[ Symbol.iterator ] === "function") {
				this.add(key, ...values);
			} else {
				this.add(key, values);
			}
		});

		return this;
	}
	get(key) {
		return this._entries.get(key);
	}
	has(key, value) {
		return this.hasKey(key) && this._entries.get(key).has(value);
	}
	delete(key, ...values) {
		const results = [];
		if(this._entries.has(key)) {
			const set = this._entries.get(key);
			values.forEach(value => results.push(set.delete(value)));
		}

		return results;
	}

	empty(key) {
		if(this._entries.has(key)) {
			this._entries.get(key).clear();
		}

		return this;
	}
	clear() {
		this._entries.clear();

		return this;
	}
};

export default MapSet;