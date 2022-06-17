import { validate } from "uuid";

import { spreadFirstElementOrArray } from "../util/helper";
import Identity from "./Identity";
import Component from "./Component";

export class RegistryEntry extends Identity {
	static Type = {
		VALUE: Symbol("VALUE"),
		ALIAS: Symbol("ALIAS"),
		POOL: Symbol("POOL"),
		// FN: Symbol("FN"),
		// REF: Symbol("REF"),
	};
	static Config = {};

	constructor (value, type = RegistryEntry.Type.VALUE, { id, config = RegistryEntry.Config, tags = [] } = {}) {
		super({ id, tags });

		this.type = type;
		this.config = config;

		if(type === RegistryEntry.Type.POOL) {
			this.value = new Set(value || []);
		} else {
			this.value = value;
		}
	}

	copy(id) {
		return new RegistryEntry(id, this.value, this.type, { tags: this.tags, config: this.config });
	}

	get isValueType() {
		return this.type === RegistryEntry.Type.VALUE;
	}
	get isAliasType() {
		return this.type === RegistryEntry.Type.ALIAS;
	}
	get isPoolType() {
		return this.type === RegistryEntry.Type.POOL;
	}
}

export class Registry extends Component {
	static Encoders = {
		Default: (self) => (entryOrValue, id, config) => {
			/**
			 * Use the RegistryEntry check to assume that the value has already
			 * been processed.  While this isn't foolproof, it is an easy solution
			 * to dealing with Aliases and Pools in more complex encoder scenarios.
			 */
			if(entryOrValue instanceof RegistryEntry) {
				const key = id || entryOrValue.id;

				self._entries.set(key, entryOrValue);

				for(let classifier of self._config.classifiers.values()) {
					classifier.call(self, key, entryOrValue.value, entryOrValue);
				}

				return key;
			} else {
				return this.Encoders.Default(self)(new RegistryEntry(entryOrValue, RegistryEntry.Type.VALUE, { id: validate(id) ? id : void 0, config }));
			}
		},
		TypeOf: (primitive) => (self) => (entryOrValue, id, config) => {
			if(typeof entryOrValue === primitive) {
				return this.Encoders.Default(self)(entryOrValue, id, config);
			}
		},
		InstanceOf: (...classes) => (self) => (entryOrValue, id, config) => {
			const isInstanceOf = classes.some(cls => entryOrValue instanceof cls);

			if(isInstanceOf || entryOrValue instanceof RegistryEntry) {
				return this.Encoders.Default(self)(entryOrValue, id, config);
			}
		},
	};
	static Decoders = {
		Default: (self) => (input) => {
			if(self.has(input)) {
				return this.Decoders.Default(self)(self._entries.get(input));
			} else if(input instanceof RegistryEntry) {
				switch(input.type) {
					case RegistryEntry.Type.VALUE:
						return input.value;
					case RegistryEntry.Type.ALIAS:
						return this.Decoders.Default(self)(input.value)
					case RegistryEntry.Type.POOL:
						return this.Decoders.Default(self)(input.value);
					default:
						return input.value;
				}
			} else if(input instanceof Set) {
				const poolValues = [];
				for(let value of input) {
					poolValues.push(this.Decoders.Default(self)(value));
				}

				return poolValues;
			}
		},
	};
	static Classifiers = {
		Is: (thing) => function (key, value, entry) {
			if(value === thing) {
				this.addToPool(`@${ thing.toString() }`, key);
			}
		},
		TypeOf: (primitive) => function (key, value, entry) {
			if(typeof value === primitive) {
				this.addToPool(`@${ primitive }`, key);
			}
		},
		InstanceOf: (clazz) => function (key, value, entry) {
			if(value instanceof clazz) {
				this.addToPool(`@${ clazz.name }`, key);
			}
		},
		HasTag: (tag) => function (key, value, entry) {
			if(typeof value === "object" && value.tags instanceof Set && value.tags.has(tag)) {
				this.addToPool(`#${ tag }`, key);
			}
		},
		/**
		 * Classify the value into a Pool for *every* tag that it has
		 */
		Tagging: ({ typeTagging = false, nameTagging = false } = {}) => function (key, value, entry) {
			if(typeof value === "object" && value.tags instanceof Set) {
				for(let tag of value.tags.values()) {
					this.addToPool(`#${ tag }`, key);
				}

				if(typeof value === "object") {
					if(nameTagging && value.name) {
						this.addToPool(`#${ value.name.toString() }`, key);
					}
					if(typeTagging && value.type) {
						this.addToPool(`#${ value.type.toString() }`, key);
					}
				}
			}
		},
	};

	/**
	 * @param {RegistryEntry} entries **Must** have RegistryEntry as values/elements
	 * @param {*} compArgs 
	 */
	constructor (entries = {}, { config, encoder, decoder, classifiers, ...rest } = {}) {
		super({ ...rest });

		this._entries = new Map();
		this._config = {
			/**
			 * Middleware to be applied to all entries before they are get or set.
			 */
			encoder: encoder || Registry.Encoders.Default,
			decoder: decoder || Registry.Decoders.Default,

			/**
			 * Middleware that auto classifies entries into aliases or pools.
			 */
			classifiers: new Set(),
		};

		this.mergeConfig(config);
		this.addClassifiers(classifiers);
		this.register(entries);

		return new Proxy(this, {
			get: (target, key) => {
				const result = Reflect.get(target, key);

				if(typeof target[ key ] === "function") {
					return result;
				} else if(target.has(key)) {
					return target.get(key);
				}

				return result;
			},
		});
	}

	register(entries = {}) {
		if(typeof entries === "object") {
			for(let key in entries) {
				const entry = entries[ key ];
				
				this.addMany({
					[ key ]: entry,
				});
			}
		}

		return this;
	}

	getConfig() {
		return this._config;
	}
	setConfig(config = {}) {
		this.config = config;

		return this.getConfig();
	}
	mergeConfig(config = {}) {
		this.config = {
			...this.config,
			...config
		};

		return this.getConfig();
	};

	get(id) {
		return this._config.decoder(this)(id);
	}
	has(id) {
		return this._entries.has(id);
	}
	set(id, entry, encoderArgs = []) {
		return this._config.encoder(this, ...encoderArgs)(entry, id);
	}
	add(value, id, config = {}, encoderArgs = []) {
		return this._config.encoder(this, ...encoderArgs)(value, id, config);
	}
	addMany(obj = {}) {
		for(let alias in obj) {
			const uuid = this.add(obj[ alias ]);

			if(uuid !== alias) {
				this.addAlias(uuid, alias);
			}
		}

		return this;
	}
	replaceValue(key, value) {
		const entry = this._entries.get(key);

		if(entry) {
			if(entry.isValueType) {
				entry.value = value;
			} else if(entry.isAliasType) {
				this.replaceValue(entry.value, value);
			}
		}

		return this;
	}
	remove(key) {
		const entry = this._entries.get(key);

		if(entry) {
			let uuid,
				results = [];
			if(entry.isValueType) {
				uuid = entry.id;
			} else if(entry.isAliasType) {
				uuid = entry.value;
			} else {
				throw new Error(`Cannot remove a RegistryEntry that is not a value or alias.`);
			}

			for(let [ key, value ] of this._entries.entries()) {
				if(value.isValueType && value.id === uuid) {
					results.push(this._entries.delete(key));
				} else if(value.isAliasType && value.value === uuid) {
					results.push(this._entries.delete(key));
				} else if(value.isPoolType && value.value.has(uuid)) {
					results.push(value.value.delete(uuid));

					/**
					 * If the pool is empty, remove it.
					 */
					if(value.value.size === 0) {
						results.push(this._entries.delete(key));
					}
				}
			}

			return results.some(result => result);
		}

		return false;
	}
	find(regex, { ids = true, values = false, aliases = true, pools = true } = {}) {
		const results = [];
		for(let [ id, entry ] of this._entries) {
			if(pools && entry.isPoolType) {
				for(let value of entry.value) {
					if(regex.test(value) || regex.test(id)) {
						results.push(entry);
						break;
					}
				}
			} else if(aliases && entry.isAliasType) {
				if(regex.test(entry.value) || regex.test(id)) {
					results.push(entry);
				}
			} else if(values && entry.isValueType) {
				if(regex.test(entry.value)) {
					results.push(entry);
				}
			} else if(ids && regex.test(id)) {
				results.push(entry);
			}
		}

		return results;
	}
	search(selector, ...args) {
		for(let [ id, entry ] of this) {
			if(selector(entry, id, ...args) === true) {
				return entry;
			}
		}

		return null;
	}
	
	addClassifier(classifier) {
		if(typeof classifier === "function") {
			this._config.classifiers.add(classifier.bind(this));
		}

		return this;
	}
	addClassifiers(...classifiers) {
		classifiers = spreadFirstElementOrArray(classifiers);
		
		for(let classifier of classifiers) {
			this.addClassifier(classifier);
		}

		return this;
	}
	removeClassifier(classifier) {
		return this._config.classifiers.delete(classifier);
	}
	removeClassifiers(...classifiers) {
		classifiers = spreadFirstElementOrArray(classifiers);

		const removed = [];
		for(let classifier of classifiers) {
			if(this.removeClassifier(classifier)) {
				removed.push(classifier);
			}
		}

		return removed;
	}

	addAlias(uuid, ...aliases) {
		if(this.has(uuid)) {
			for(let alias of aliases) {
				this.set(alias, new RegistryEntry(uuid, RegistryEntry.Type.ALIAS, { id: alias }));
			}
		}

		return this;
	}
	/**
	 * { [ alias ] : uuid, [ alias ] : [ ...uuid ]("Pool"), ... }
	 */
	addAliasObject(obj = {}) {
		let entries;
		if(Array.isArray(obj)) {
			entries = obj;
		} else {
			entries = Object.entries(obj);
		}

		for(let [ alias, uuid ] of entries) {
			if(Array.isArray(uuid)) {
				this.setPool(alias, uuid);
			} else if(this.has(uuid)) {
				this.addAlias(uuid, alias);
			}
		}

		return this;
	}
	removeAlias(uuid, ...aliases) {
		if(this.has(uuid)) {
			for(let alias of aliases) {
				this.remove(alias);
			}
		}

		return this;
	}

	getPool(name, asRegistry = false) {
		const pool = this.get(name);

		if(pool) {
			/**
			 * Optionally return the Pool as a new Registry
			 */
			if(asRegistry) {
				return new Registry(pool);
			}
			
			return pool;
		}

		return [];
	}
	setPool(name, ...uuids) {
		const poolEntry = this._entries.get(name);
		const cleanedUuids = uuids.filter(uuid => validate(uuid) && this.has(uuid));

		if(poolEntry && poolEntry.isPoolType) {
			poolEntry.value = new Set(cleanedUuids);
		} else if(!this.has(name)) {

			this.set(name, new RegistryEntry(new Set(cleanedUuids), RegistryEntry.Type.POOL));
		}

		return this;
	}
	addToPool(name, ...uuids) {
		const poolEntry = this._entries.get(name);

		if(poolEntry && poolEntry.isPoolType) {
			for(let uuid of uuids) {
				if(validate(uuid)) {
					poolEntry.value.add(uuid);
				}
			}
		} else {
			this.setPool(name, ...uuids);
		}

		return this;
	}
	removeFromPool(name, ...uuids) {
		const poolEntry = this._entries.get(name);

		if(poolEntry && poolEntry.isPoolType) {
			for(let uuid of uuids) {
				if(validate(uuid)) {
					poolEntry.value.delete(uuid);
				}
			}

			if(poolEntry.value.size === 0) {
				this.remove(name);
			}
		}

		return this;
	}

	[ Symbol.iterator ]() {
		const data = Array.from(this._entries.values()).reduce((a, e) => {
			if(e.isValueType) {
				return [ ...a, [ e.id, e.value ] ];
			}

			return a;
		}, []);

		return data[ Symbol.iterator ]();
	}

	forEach(callback, ...args) {
		for(let [ id, entry ] of this) {
			callback(entry, id, ...args);
		}
	}
	map(callback, ...args) {
		const registry = new Registry();
		for(let [ id, entry ] of this) {
			registry.add(callback(entry, id, ...args), id);
		}

		return registry;
	}
	reduce(callback, initialValue, ...args) {
		let value = initialValue;
		for(let [ id, entry ] of this) {
			value = callback(value, entry, id, ...args);
		}

		return value;
	}
	filter(callback, ...args) {
		const registry = new Registry();
		for(let [ id, entry ] of this) {
			if(callback(entry, id, ...args) === true) {
				registry.add(entry, id);
			}
		}

		return registry;
	}

	union(...registries) {
		const results = new Registry({ config: this._config });

		for(let registry of registries) {
			for(let [ id, entry ] of registry) {
				results.set(id, entry);
			}
		}

		return results;
	}
	intersection(...registries) {
		const results = new Registry({ config: this._config });

		for(let registry of registries) {
			for(let [ id, entry ] of registry) {
				if(this.has(id)) {
					results.set(id, entry);
				}
			}
		}

		return results;
	}

	/**
	 * The .keys, .values, and .entries getters will select only RegistryEntry.Type.VALUE entries.
	 */
	get keys() {
		const results = [];
		for(let [ id, entry ] of this) {
			if(entry.isValueType) {
				results.push(id);
			}
		}

		return results;
	}
	get values() {
		const results = [];
		for(let [ id, entry ] of this._entries.entries()) {
			if(entry.isValueType) {
				results.push(entry.value);
			}
		}

		return results;
	}
	get entries() {
		const results = [];
		for(let [ id, entry ] of this._entries.entries()) {
			if(entry.isValueType) {
				results.push([ id, entry.value ]);
			}
		}

		return results;
	}

	/**
	 * The .aliases and .pools getters will return an entry-array of [ key, resolved value ] pairs.
	 */
	get pools() {
		return Array.from(this._entries.entries()).filter(([ key, entry ]) => entry.isPoolType).map(([ key, entry ]) => [ key, entry.value ]);
	}
	get aliases() {
		return Array.from(this._entries.values()).filter(entry => entry.isAliasType).map(entry => [ entry.id, entry.value ]);
	}

	get size() {
		return this._entries.size;
	}

	static MapRegistryEntries(entries = {}, baseMap) {
		/**
		 * Short-circuit if no entries are provided.
		 */
		if(Object.keys(entries).length === 0 || (baseMap != null && !(baseMap instanceof Map))) {
			return baseMap || new Map();
		}

		/**
		 * Optionally allow a base Map to be provided.
		 */
		const map = baseMap || new Map();
		if(entries instanceof Map) {
			/**
			 * If the entries are already a Map, just copy it.
			 */
			return this.MapRegistryEntries(Object.fromEntries(entries));
		} else if(Array.isArray(entries)) {
			/**
			 * Only allow RegistryEntry arrays
			 */
			for(let entry of entries) {
				if(entry instanceof RegistryEntry) {
					map.set(entry.id, entry);
				}
			}
		} else if(typeof entries === "object") {
			/**
			 * If the entries are an object, map each entry to an aliased RegistryEntry.
			 */
			for(let [ id, entry ] of Object.entries(entries)) {
				if(entry instanceof RegistryEntry) {
					map.set(id, entry);
				}
			}
		} else if(entries instanceof Registry) {
			map.set(entries.id, entries);
		}

		return map;
	}
}

export default Registry;