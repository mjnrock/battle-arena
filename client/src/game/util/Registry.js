import { validate } from "uuid";
import { Identity } from "../util/Identity";

export class RegistryEntry extends Identity {
	static Type = {
		VALUE: Symbol("VALUE"),
		ALIAS: Symbol("ALIAS"),
		POOL: Symbol("POOL"),
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

	copy() {
		return new RegistryEntry(this.value, this.type, { tags: this.tags, config: this.config });
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

export class Registry extends Identity {
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
	static Middleware = {
		AttachRef: (self, key) => function (k, v, e) {
			if(self && key && Identity.Comparators.IsObject(v)) {
				v[ key ] = self;
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
			if(clazz === true) {
				if(Identity.Comparators.IsClass(value)) {
					this.addToPool(`@${ value.constructor.name }`, key);
				}
			} else if(value instanceof clazz) {
				this.addToPool(`@${ clazz.name }`, key);
			}
		},
		HasAttribute: (attr) => function (key, value, entry) {
			if(typeof value === "object" && value[ attr ] !== void 0) {
				this.addToPool(`@${ attr }`, key);
			}
		},
		TagIs: (tag) => function (key, value, entry) {
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

	constructor (entries = {}, { encoder, decoder, classifiers = [], config, id, tags } = {}) {
		super({ id, tags });

		this._entries = new Map();
		this._config = {
			/**
			 * Middleware to be applied to all entries before they are set.
			 */
			encoder: encoder || Registry.Encoders.Default,

			/**
			 * Middleware to be applied to all entries before they are get.
			 */
			decoder: decoder || Registry.Decoders.Default,

			/**
			 * Middleware that can auto classify entries into aliases or pools.
			 * Since these are just functions, they can also be used to perform
			 * work to entries, as they registered (e.g. attaching a ref, logging, etc.)
			 */
			classifiers: new Set(),
		};

		this.mergeConfig(config);
		this.registerMany(entries);
		this.registerClassifiers(...classifiers);

		return new Proxy(this, {
			get: (target, key) => {
				const result = Reflect.get(target, key);

				if(result) {
					return result;
				} else if(target.has(key)) {
					return target.get(key);
				}

				return result;
			},
		});
	}

	deconstructor() { }

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
	update(key, value, merge = false) {
		const entry = this._entries.get(key);

		if(entry) {
			if(entry.isValueType) {
				if(merge) {
					if(Array.isArray(entry.value)) {
						entry.value.push(value);
					} else if(typeof entry.value === "object") {
						entry.value = {
							...entry.value,
							...value,
						};
					} else {
						entry.value = value;
					}

					return this;
				}

				entry.value = value;
			} else if(entry.isAliasType) {
				this.update(entry.value, value, merge);
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
	clear() {
		this._entries.clear();

		return this;
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

	register(value, ...opts) {
		return this.add(value, ...opts);
	}
	registerWithAlias(value, alias, ...opts) {
		const uuid = this.add(value, ...opts);

		if(uuid && alias) {
			if(Array.isArray(alias)) {
				this.registerAlias(uuid, ...alias);
			} else {
				this.registerAlias(uuid, alias);
			}
		}

		return uuid;
	}
	registerMany(entries = {}, optsFn) {
		if(!optsFn) {
			optsFn = () => [];
		}

		let uuids = [];
		if(Identity.Comparators.IsArray(entries)) {
			for(let i = 0; i < entries.length; i++) {
				const value = entries[ i ];
				const uuid = this.register(value, ...optsFn(value, i));

				uuids.push(uuid);
			}
		} else if(Identity.Comparators.IsObject(entries)) {
			for(let key of Object.keys(entries)) {
				const value = entries[ key ];
				const uuid = this.registerWithAlias(value, key, ...optsFn(value, key));

				uuids.push(uuid);
			}
		}

		return uuids;
	}
	unregister(...uuids) {
		const results = [];

		for(let uuid of uuids) {
			results.push(this._entries.delete(uuid));
		}

		return results;
	}

	registerAlias(uuid, ...aliases) {
		const entry = this._entries.get(uuid);

		if(entry && entry.isValueType) {
			for(let alias of aliases) {
				let aliasEntry = new RegistryEntry(uuid, RegistryEntry.Type.ALIAS);

				this._entries.set(alias, aliasEntry);
			}
		}
	}
	unregisterAlias(...aliases) {
		const results = [];
		for(let alias of aliases) {
			results.push(this._entries.delete(alias));
		}

		return results;
	}

	registerClassifiers(...classifiers) {
		for(let classifier of classifiers) {
			if(typeof classifier === "function") {
				this._config.classifiers.add(classifier.bind(this));
			}
		}
	}
	unregisterClassifiers(...classifiers) {
		const removed = [];
		for(let classifier of classifiers) {
			if(this._config.classifiers.delete(classifier)) {
				removed.push(classifier);
			}
		}

		return removed;
	}



	//#region Iteration and Related
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
		const registry = new Registry({ config: this._config });
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
		const registry = new Registry({ config: this._config });
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

	get count() {
		return this._entries.size;
	}
	//#endregion Iteration and Related
}

export default Registry;