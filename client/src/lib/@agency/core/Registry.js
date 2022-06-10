import { validate } from "uuid";
import { v4 as uuid } from "uuid";
import { spreadFirstElementOrArray } from "../util/helper";

import AgencyBase from "./AgencyBase";

export class RegistryEntry extends AgencyBase {
	static Type = {
		VALUE: Symbol("VALUE"),
		ALIAS: Symbol("ALIAS"),
		FUNCTION: Symbol("FUNCTION"),
		POOL: Symbol("POOL"),
	};

	constructor (id, value, type = RegistryEntry.Type.VALUE, tags = [], config = {}) {
		super({ id, tags });

		this.type = type;
		this.config = config;	//TODO Use the YTBC, formalized Config system

		if(type === RegistryEntry.Type.POOL) {
			this.value = new Set(value || []);
		} else {
			this.value = value;
		}

		return this;
	}

	getValue(registry) {
		if(this.type === RegistryEntry.Type.VALUE) {
			return this.value;
		} else if(this.type === RegistryEntry.Type.ALIAS) {
			return registry.get(this.value);
		} else if(this.type === RegistryEntry.Type.FUNCTION) {
			return this.value(registry);
		} else if(this.type === RegistryEntry.Type.POOL) {
			return Array.from(this.value).map(id => registry.get(id));
		}
	}

	get isValueType() {
		return this.type === RegistryEntry.Type.VALUE;
	}
	get isAliasType() {
		return this.type === RegistryEntry.Type.ALIAS;
	}
	get isFunctionType() {
		return this.type === RegistryEntry.Type.FUNCTION;
	}
	get isPoolType() {
		return this.type === RegistryEntry.Type.POOL;
	}
};

export class Registry extends AgencyBase {
	static Encoders = {
		SetEntry: (self, id, value, type) => {
			self.registry.set(id, new RegistryEntry(id, value, type));

			return true;
		},
		SetVariant: (self, id, value, type) => {
			if(value instanceof RegistryEntry) {
				// RegistryEntry
				self.registry.set(id, value);
				
				return true;
			} else if(validate(value)) {
				// Alias
				self.registry.set(id, new RegistryEntry(id, value, RegistryEntry.Type.ALIAS));
				
				return true;
			} else if(Array.isArray(value) && value.every(e => validate(e))) {
				// Pool
				self.registry.set(id, new RegistryEntry(id, value, RegistryEntry.Type.POOL));
				
				return true;
			}

			return false;
		},
		InstanceOf: (self, ...classes) => (id, value, type = RegistryEntry.Type.VALUE) => {
			const isInstanceOf = classes.some(cls => value instanceof cls);
			
			if(isInstanceOf) {
				return this.Encoders.SetEntry(self, id, value, type);
			} else {
				this.Encoders.SetVariant(self, id, value, type);
			}

			return false;
		},
	};

	constructor (entries = [], { encoder, decoder, agent = {} } = {}) {
		super(agent);

		this.registry = new Map();
		this.registerMany(...entries);

		if(typeof encoder === "function") {
			this.encoder = encoder;
		}
		if(typeof decoder === "function") {
			this.decoder = decoder;
		}

		return new Proxy(this, {
			get: (target, key) => {
				const result = Reflect.get(target, key);

				if(typeof target[ key ] === "function") {
					return result;
				} else if(target.has(key)) {
					return target.decoder(key);
				}

				return result;
			},
		});
	}

	[ Symbol.iterator ]() {
		const data = this.ids.map(id => this.get(id));
		let index = 0;

		return {
			next: function () {
				return { value: data[ ++index ], done: !(index in data) }
			}
		};
	}

	/**
	 * This is a middleware encoder that will determine the actual value that will be stored in the registry.
	 * If overriden, ensure that the value returned is a << RegistryEntry >>.
	 */
	encoder(id, entry, type = RegistryEntry.Type.VALUE) {
		this.registry.set(id, new RegistryEntry(id, entry, type));

		return this.registry.has(id);
	}
	decoder(input) {
		if(this.has(input)) {
			return this.registry.get(input).getValue(this);
		} else if(input instanceof RegistryEntry) {
			return input.getValue(this);
		} else if(typeof input === "function") {			//* @input is a function
			return this.decoder(input(this));
		}

		return void 0;
	}

	has(id) {
		return this.registry.has(id);
	}
	get(id) {
		return this.decoder(id);
	}
	getEntry(input) {
		return this.registry.get(input);
	}
	getEntryValue(input) {
		const entry = this.registry.get(input);

		if(entry instanceof RegistryEntry) {
			return entry.getValue(this);
		}

		return void 0;
	}
	find(input) {
		if(this.has(input)) {
			/**
			 * @input is either an Id, Alias, or Pool name
			 */
			return this.get(input);
		} else if(typeof input === "function") {
			/**
			 * Execute a testing function on each entry and include results that return true.
			 */
			const results = [];
			for(let [ id, entry ] of this.registry.entries()) {
				if(input(id, entry) === true) {
					results.push(entry);
				}
			}

			return results;
		} else if(typeof input === "string") {
			/**
			 * By this point, assume that the input is a string and it is a tag.
			 */
			const results = [];
			for(let [ id, entry ] of this.registry.entries()) {
				if(entry.tags.includes(input)) {
					results.push(entry);
				}
			}

			return results;
		}

		return void 0;
	}
	findId(input) {
		for(let [ id, entry ] of this.registry.entries()) {
			if(entry.value === input) {
				return id;
			}
		}

		return false;
	}
	/**
	 * This is a restricted setter that only allows for the addition of:
	 * 		1) RegistryEntry
* 			2) A valid UUID and entry that will become a VALUE type
	 */
	set(id, entry) {
		if(id instanceof RegistryEntry) {
			this.registry.set(id.id, id);

			return true;
		} else if(validate(id)) {
			return this.encoder(id, entry, RegistryEntry.Type.VALUE);
		}

		return false;
	}
	/**
	 * Specifically update the .value of the RegistryEntry, to preserve all
	 * aliases and pools, as well as to maintain the same id.  Optionally, a
	 * callback function can be passed to perform work if the update was 
	 * successful (e.g. add to a state change recorder for historical log).
	 */
	update(id, value, callback) {
		const entry = this.registry.get(id);

		if(entry instanceof RegistryEntry && entry.isValueType) {
			const oldValue = entry.value;
			entry.value = value;

			if(callback) {
				callback(oldValue, value);
			}

			return true;
		}

		return false;
	}
	add(input) {
		return this.register(input);
	}
	remove(id) {
		if(id instanceof RegistryEntry) {
			return this.remove(id.id);
		} else if(typeof id === "object" && id.id) {
			return this.remove(id.id);
		}

		for(let [ key, entry ] of this.entries) {
			const value = entry.value;

			if(key === id) {
				this.registry.delete(key);
			} else if(entry.isAliasType) {
				if(value === id) {
					this.registry.delete(key);
				}
			} else if(entry.isPoolType) {
				if(value.has(id)) {
					entry.value.delete(id);
				}
			}
		}

		return this;
	}

	get keys() {
		return this.registry.keys();
	}
	get values() {
		return this.registry.values();
	}
	get entries() {
		return this.registry.entries();
	}

	get ids() {
		return Array.from(this.entries).reduce((arr, [ key, value ]) => {
			if(value.type === RegistryEntry.Type.VALUE) {
				return [ ...arr, key ]
			}

			return arr;
		}, []);
	}
	get aliases() {
		return Array.from(this.entries).reduce((arr, [ key, value ]) => {
			if(value.type === RegistryEntry.Type.ALIAS) {
				return [ ...arr, key ]
			}

			return arr;
		}, []);
	}
	get pools() {
		return Array.from(this.entries).reduce((arr, [ key, value ]) => {
			if(value.type === RegistryEntry.Type.POOL) {
				return [ ...arr, key ]
			}

			return arr;
		}, []);
	}
	/**
	 * The "values" equivalent of .ids
	 */
	get iterator() {
		return this.ids.map(id => this.get(id)).values();
	}

	get size() {
		return this.registry.size;
	}
	get sizeValues() {
		return Array.from(this.iterator).length;
	}
	get sizeAlias() {
		return this.aliases.length;
	}
	get sizePools() {
		return this.pools.length;
	}

	register(entry) {
		if(typeof entry === "object" && "id" in entry) {
			if(this.encoder(entry.id, entry, RegistryEntry.Type.VALUE)) {
				return entry.id;
			}

			return false;
		}
		
		const id = uuid();
		if(this.encoder(id, entry, RegistryEntry.Type.VALUE)) {
			return id;
		}
		
		return false;
	}
	registerMany(...entries) {
		entries = spreadFirstElementOrArray(entries);

		for(let entry of entries) {
			this.register(entry);
		}

		return this;
	}
	unregister(id) {
		this.remove(id);

		return this;
	}
	unregisterMany(...ids) {
		ids = spreadFirstElementOrArray(ids);

		for(let id of ids) {
			this.remove(id);
		}

		return this;
	}

	addAlias(id, ...aliases) {
		if(this.has(id)) {
			for(let alias of aliases) {
				if(!!alias) {
					this.encoder(alias, id, RegistryEntry.Type.ALIAS);
				}
			}

			return true;
		}

		return false;
	}
	removeAlias(id, ...aliases) {
		if(this.has(id)) {
			for(let alias of aliases) {
				this.registry.delete(alias);
			}

			return true;
		}

		return false;
	}
	getIdFromAlias(alias) {
		return this.decoder(alias);
	}
	getAliasFromId(id, firstMatchOnly = true) {
		const results = [];
		for(let [ alias, entry ] of this.registry) {
			if(entry === id) {
				if(firstMatchOnly) {
					return alias;
				}

				results.push(alias);
			}
		}

		return results;
	}

	registerWithAlias(entry, ...aliases) {
		const id = this.register(entry);

		return this.addAlias(id, ...aliases);
	}
	registerManyWithAlias(...array) {
		const results = [];
		for(let [ entry, ...aliases ] of array) {
			results.push(this.registerWithAlias(entry, ...aliases));
		}

		return results;
	}

	getPool(tag) {
		const pool = this.registry.get(tag);

		if(pool instanceof RegistryEntry && pool.type === RegistryEntry.Type.POOL) {
			return pool.getValue(this);
		}

		return [];
	}
	setPool(tag, ...ids) {
		if(Array.isArray(ids[ 0 ])) {
			[ ids ] = ids;
		}

		this.encoder(tag, ids, RegistryEntry.Type.POOL);

		return this;
	}
	addToPool(tag, ...ids) {
		if(Array.isArray(ids[ 0 ])) {
			[ ids ] = ids;
		}

		const pool = this.getEntry(tag);
		if(pool instanceof RegistryEntry && pool.type === RegistryEntry.Type.POOL) {
			const values = pool.value;

			this.setPool(tag, [ ...values, ...ids ]);

			return true;
		}

		return false;
	}


	static FilterValuesOnly = (id, entry) => entry.type === RegistryEntry.Type.VALUE;
	static FilterAliasOnly = (id, entry) => entry.type === RegistryEntry.Type.ALIAS;
	static FilterPoolOnly = (id, entry) => entry.type === RegistryEntry.Type.POOL;
	filter(selector) {
		if(typeof selector === "function") {
			const results = [];
			for(let [ id, entry ] of this.registry) {
				if(selector(id, entry) === true) {
					results.push(entry);
				}
			}

			return results;
		}

		return void 0;
	}

	forEach(fn, selector) {
		if(typeof fn === "function") {
			let entries;
			if(typeof selector === "function") {
				entries = this.filter(selector);
			} else {
				entries = this.registry.values();
			}

			for(let i = 0; i < entries.length; i++) {
				fn(entries[ i ], i);
			}
		}

		return this;
	}
	map(fn, selector) {
		if(typeof fn === "function") {
			let entries;
			if(typeof selector === "function") {
				entries = this.filter(selector);
			} else {
				entries = this.registry.values();
			}

			const results = [];
			for(let i = 0; i < entries.length; i++) {
				results.push(fn(entries[ i ], i));
			}

			return results;
		}

		return void 0;
	}
	reduce(fn, initialValue, selector) {
		if(typeof fn === "function") {
			let entries;
			if(typeof selector === "function") {
				entries = this.filter(selector);
			} else {
				entries = this.registry.values();
			}

			let result = initialValue;
			for(let i = 0; i < entries.length; i++) {
				result = fn(result, entries[ i ], i);
			}

			return result;
		}

		return void 0;
	}

	union(...tags) {
		const results = new Set();
		for(let tag of tags) {
			const pool = this.getPool(tag);

			for(let entry of pool) {
				results.add(entry);
			}
		}

		return results.values();
	}
	intersection(...tags) {
		const results = new Map();
		for(let tag of tags) {
			const pool = this.getPool(tag);

			for(let entry of pool) {
				if(results.has(entry)) {
					results.set(entry, results.get(entry) + 1);
				} else {
					results.set(entry, 1);
				}
			}
		}

		for(let [ entry, count ] of results) {
			if(count < tags.length) {
				results.delete(entry);
			}
		}

		return results.keys();
	}

	copy() {
		const registry = new Registry();
		for(let [ id, entry ] of this.registry) {
			registry.register(entry);
		}

		return registry;
	}
	merge(...registries) {
		for(let registry of registries) {
			for(let [ id, entry ] of registry.registry) {
				this.set(entry);
			}
		}

		return this;
	}
	mergeInto(...registries) {
		for(let registry of registries) {
			registry.merge(this);
		}

		return this;
	}

	getInsertionIndex(id) {
		const entry = this.registry.get(id);
		if(entry instanceof RegistryEntry) {
			return this.registry.values().indexOf(entry);
		}

		return -1;
	}
};

export default Registry;