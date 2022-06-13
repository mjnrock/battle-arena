import { validate } from "uuid";
import { singleOrArrayArgs } from "../util/helper";
import AgencyBase from "../core/AgencyBase";

export class RegistryEntry extends AgencyBase {
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

export class Registry extends AgencyBase {
	static Encoders = {
		Default: (self) => (value, id, config) => {
			if(value instanceof RegistryEntry) {
				self.__entries.set(id || value.id, value);

				return id || value.id;
			} else {
				return this.Encoders.Default(self)(new RegistryEntry(value, RegistryEntry.Type.VALUE, { id: validate(id) ? id : void 0, config }));
			}
		},
	};
	static Decoders = {
		Default: (self) => (input) => {
			if(self.has(input)) {
				return this.Decoders.Default(self)(self.__entries.get(input));
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
		Default: () => {},
	};

	constructor ({ config = {}, encoder, decoder, classifiers = [], agencyBase = {} } = {}) {
		super(agencyBase);

		this.__entries = new Map();
		this.__meta = new Map();
		this.__cache = new WeakMap();
		this.__config = {
			autoCache: true,
			cacheThreshold: 100,
			encoder: encoder || Registry.Encoders.Default,
			decoder: decoder || Registry.Decoders.Default,
			classifiers: new Set(classifiers),
		};

		this.mergeConfig(config);

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

	get(id) {
		return this.__config.decoder(this)(id);
	}
	has(id) {
		return this.__entries.has(id);
	}
	set(id, entry) {
		return this.__config.encoder(this)(entry, id);
	}
	add(value, id, config = {}) {
		return this.__config.encoder(this)(value, id, config);
	}

	addAlias(uuid, ...aliases) {
		if(this.has(uuid)) {
			for(let alias of aliases) {
				this.set(alias, new RegistryEntry(uuid, RegistryEntry.Type.ALIAS, { id: alias }));
			}
		}

		return this;
	}
	removeAlias(uuid, ...aliases) {
		if(this.has(uuid)) {
			const results = [];
			for(let alias of aliases) {
				results.push(this.remove(alias));
			}

			return results;
		}

		return [];
	}

	setPool(name, ...uuids) {
		const poolEntry = this.__entries.get(name);

		if(poolEntry && poolEntry.isPoolType) {
			poolEntry.value = new Set(uuids);
		} else if(!this.has(name)) {
			this.set(name, new RegistryEntry(new Set(uuids), RegistryEntry.Type.POOL));
		}

		return this;
	}
	addToPool(name, ...uuids) {
		const poolEntry = this.__entries.get(name);

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


	getConfig() {
		return this.__config;
	}
	setConfig(config = {}) {
		this.config = config;

		return this;
	}
	mergeConfig(config = {}) {
		this.config = {
			...this.config,
			...config
		};

		return this;
	};
}

export default Registry;