export class CollectionArray {
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

	[ Symbol.iterator ]() {
		return this.items;
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

export default CollectionArray;