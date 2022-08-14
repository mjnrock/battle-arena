export class Collection {
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
		return Collection.Map(this, fn, ...args);
	}
	filter(fn, ...args) {
		return Collection.Filter(this, fn, ...args);
	}
	reduce(fn, ...args) {
		return Collection.Reduce(this, fn, ...args);
	}
	each(fn, ...args) {
		return Collection.Each(this, fn, ...args);
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

	static Map(collection, fn, ...args) {
		return collection.items.map(fn, ...args);
	}
	static Filter(collection, fn, ...args) {
		return collection.items.filter(fn, ...args);
	}
	static Reduce(collection, fn, ...args) {
		return collection.items.reduce(fn, ...args);
	}
	static Each(collection, fn, ...args) {
		return collection.items.forEach(fn, ...args);
	}


	static Union(collection1, collection2) {
		return new Collection(collection1.items.concat(collection2.items));
	}
	static Intersection(collection1, collection2) {
		return new Collection(collection1.items.filter(item => collection2.items.includes(item)));
	}
};

export default Collection;