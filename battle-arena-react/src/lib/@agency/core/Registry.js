import { validate } from "uuid";
import { v4 as uuid } from "uuid";

import AgencyBase from "./AgencyBase";
import { RegistryEntry } from "./RegistryEntry";

export class Registry extends AgencyBase {
	static Constants = {
		NoResults: Symbol("NoResults"),
	};

	constructor (entries = [], agencyBaseObj = {}) {
		super(agencyBaseObj);

		this.registry = new Map();
		this.registerMany(...entries);

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

	encoder(id, entry, type = RegistryEntry.Type.VALUE) {
		this.registry.set(id, new RegistryEntry(id, entry, type));
	}
	decoder(input) {
		if(this.has(input)) {
			return this.registry.get(input).getValue(this);
		} else if(input instanceof RegistryEntry) {
			return input.getValue(this);
		} else if(typeof input === "function") {			//* @input is a function
			return this.decoder(input(this));
		}

		return Registry.Constants.NoResults;
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

		return Registry.Constants.NoResults;
	}
	find(input) {
		if(this.has(input)) {
			return this.get(input);
		} else if(typeof input === "function") {
			const results = [];
			for(let [ id, entry ] of this.registry) {
				if(input(id, entry) === true) {
					results.push(entry);
				}
			}

			return results;
		}

		return Registry.Constants.NoResults;
	}
	set(id, entry) {
		if(id instanceof RegistryEntry) {
			this.registry.set(id.id, id);

			return true;
		} else if(validate(id)) {
			this.encoder(id, entry, RegistryEntry.Type.VALUE);

			return true;
		}

		return false;
	}
	remove(id) {
		for(let [ key, entry ] of this.entries) {
			const value = entry.value;

			if(key === id) {					//* @key is the UUID
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
		return Array.from(this.keys).filter(key => validate(key));
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

	get size() {
		return this.registry.size;
	}
	get sizeAlias() {
		return this.aliases.length;
	}
	get sizePools() {
		return this.pools.length;
	}

	register(entry) {
		if(typeof entry === "object" && "id" in entry) {
			this.encoder(entry.id, entry, RegistryEntry.Type.VALUE);

			return entry.id;
		}

		const id = uuid();
		this.encoder(id, entry, RegistryEntry.Type.VALUE);

		return id;
	}
	registerMany(...entries) {
		for(let entry of entries) {
			this.register(entry);
		}

		return this;
	}

	addAlias(id, ...aliases) {
		if(this.has(id)) {
			for(let alias of aliases) {
				this.encoder(alias, id, RegistryEntry.Type.ALIAS);
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

		return Registry.Constants.NoResults;
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

		return Registry.Constants.NoResults;
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

		return Registry.Constants.NoResults;
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
};

export default Registry;