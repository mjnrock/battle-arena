import { Registry } from "./Registry";

export class Collection {
	constructor ({ items = {}, current, curator } = {}) {
		/**
		 * The currently selected item in the Collection
		 */
		this._current = current;

		/**
		 * The list of items in the Collection
		 */
		this.items = new Registry(items);


		/**
		 * Function STUB, will just maintain status quo until overriden
		 */
		this.curator = curator || (() => this._current);
	}

	get current() {
		return this.items[ this._current ];
	}

	curate(...args) {
		this.curator(...args);
	}

	get(key) {
		return this.items[ key ];
	}
	set(item, key) {
		this.items.registerWithAlias(item, key);

		return this;
	}
	add(obj) {
		this.items.registerMany(obj);

		return this;
	}

	remove(...keys) {
		keys.forEach(key => this.items.remove(key));

		return this;
	}
	clear() {
		this.items = new Registry();

		return this;
	}


	map(fn, ...args) {
		return Array.from(this.items.entries).map(([ key, value ]) => fn(key, value, ...args));
	}
	filter(fn, ...args) {
		return Array.from(this.items.entries).filter(([ key, value ]) => fn(key, value, ...args));
	}
	reduce(fn, ...args) {
		return Array.from(this.items.entries).reduce((acc, [ key, value ]) => fn(acc, key, value, ...args));
	}
	each(fn, ...args) {
		Array.from(this.items.entries).forEach(([ key, value ]) => fn(key, value, ...args));
	}

	[ Symbol.iterator ]() {
		return this.items.corpus;
	}

	get size() {
		return this.items.size;
	}
};

export default Collection;