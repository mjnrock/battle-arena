import { validate } from "uuid";
import { v4 as uuid } from "uuid";

export class Registry {
	static Constants = {
		NoResults: Symbol("NoResults"),
	};

	constructor (entries = []) {
		this.registry = new Map();
		this.registerMany(...entries);

		return new Proxy(this, {
			get: (target, key) => {
				const result = Reflect.get(target, key);
				
				if(validate(key)) {
					return target.registry.get(key);
				} else if(validate(result)) {
					return target.registry.get(result);
				}

				return result;
			},
		});
	}

	has(id) {
		return this.registry.has(id);
	}
	get(id) {
		return this.registry.get(id);
	}
	find(input) {
		if(validate(input)) {
			return this.registry.get(input);			//* @input is a valid UUID
		} else if(this.registry.has(input)) {
			return this.get(this.registry.get(input));	//* @input is an alias
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
		if(validate(id)) {
			this.registry.set(id, entry);

			return true;
		}

		return false;
	}
	remove(id) {
		return this.registry.delete(id);
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
	get size() {
		return this.registry.size;
	}

	register(entry) {
		if(typeof entry === "object" && "id" in entry) {
			this.registry.set(entry.id, entry);

			return entry.id;
		}

		const id = uuid();
		this.registry.set(id, entry);

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
				this.registry.set(alias, id);
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
		return this.registry.get(alias);
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
}