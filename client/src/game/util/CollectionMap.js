export class Collection {
	constructor ({ items = {}, current } = {}) {
		/**
		 * The list of items in the Collection
		 */
		this.items = new Map();
		this.add(items);

		/**
		 * The currently selected item in the Collection
		 */
		this._current = current;


		/**
		 * Function STUB, will just maintain status quo until overriden
		 */
		this.curator = () => this._current;
	}

	get current() {
		return this.items.get(this._current);
	}

	curate(...args) {
		this.curator(...args);
	}

	get(key) {
		return this.items.get(key);
	}
	set(key, item) {
		this.items.set(key, item);

		return this;
	}
	add(obj) {
		let iter;
		if(Array.isArray(obj)) {
			iter = obj;
		} else if(typeof obj === "object") {
			iter = Object.entries(obj);
		}

		iter.forEach(([ key, value ]) => this.items.set(key, value));

		return this;
	}

	remove(...keys) {
		keys.forEach(key => this.items.delete(key));

		return this;
	}
	clear() {
		this.items = new Map();

		return this;
	}


	map(fn, ...args) {
		return Array.from(this.items.entries()).map(([ key, value ]) => fn(key, value, ...args));
	}
	filter(fn, ...args) {
		return Array.from(this.items.entries()).filter(([ key, value ]) => fn(key, value, ...args));
	}
	reduce(fn, ...args) {
		return Array.from(this.items.entries()).reduce((acc, [ key, value ]) => fn(acc, key, value, ...args));
	}
	each(fn, ...args) {
		Array.from(this.items.entries()).forEach(([ key, value ]) => fn(key, value, ...args));
	}

	[ Symbol.iterator ]() {
		return this.items.entries();
	}

	get size() {
		return this.items.size;
	}
};

export default Collection;