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

export class ArrayCollection {
	constructor (items = []) {
		/**
		 * The list of items in the Collection
		 */
		this.items = items;

		/**
		 * The currently selected item in the Collection
		 */
		this._current = 0;

		/**
		 * Function STUB, will just maintain status quo until overriden
		 */
		this.curator = () => this._current;
	}

	get current() {
		return this.items[ this._current ];
	}

	curate(...args) {
		this.curator(...args);
	}

	get(index) {
		return this.items[ index ];
	}
	add(...items) {
		this.items.push(...items);

		return this;
	}
	set(index, item) {
		this.items[ index ] = item;

		return this;
	}

	remove(...items) {
		this.items = this.items.filter(item => !items.includes(item));

		return this;
	}
	clear() {
		this.items = [];

		return this;
	}

	swap(index1, index2) {
		let item1 = this.items[ index1 ];
		let item2 = this.items[ index2 ];

		this.items[ index1 ] = item2;
		this.items[ index2 ] = item1;

		return this;
	}


	map(fn, ...args) {
		return this.items.map((item, i) => fn(item, i, ...args));
	}
	filter(fn, ...args) {
		return this.items.filter((item, i) => fn(item, i, ...args));
	}
	reduce(fn, ...args) {
		return this.items.reduce((acc, item, i) => fn(acc, item, i, ...args));
	}
	each(fn, ...args) {
		this.items.forEach((item, i) => fn(item, i, ...args));
	}


	union(collection) {
		this.items = this.items.concat(collection.items);

		return this;
	}
	intersection(collection) {
		this.items = this.items.filter(item => collection.items.includes(item));

		return this;
	}

	get [ Symbol.iterator ]() {
		return this.items[ Symbol.iterator ];
	}

	get first() {
		return this.items[ 0 ];
	}
	get last() {
		return this.items[ this.items.length - 1 ];
	}
	get length() {
		return this.items.length;
	}
};

export default Collection;