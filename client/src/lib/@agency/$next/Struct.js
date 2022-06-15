import AgencyBase from "./AgencyBase";

/**
 * This is meant to be a DataFrame/ActiveRecord that is used to store and manage
 * the data of an Entity, through the use of Components.  It contains CRUD-like
 * helper functions, and a few serialization methods that can be overridden to
 * produce custom serialization.
 * 
 * NOTE that serialization does **not** decompose Objects or Arrays, but instead
 * serializes them as-is.  This can be overridden, as needed, with a custom serializer.
 */
export class Struct extends AgencyBase {
	static Hooks = {
		VIEW: "view",
		REDUCER: "reducer",
		EFFECT: "effect",
		DELETE: "delete",
	};

	constructor (state = {}, { id, tags } = {}) {
		super({ id, tags })

		/**
		 * These are proxy hooks that affect how the Component behaves,
		 * in general (e.g. Accessor hook to return value from an API)
		 */
		Reflect.defineProperty(this, "__hooks", {
			configurable: true,
			enumerable: false,
			writable: false,
			value: {
				[ Struct.Hooks.VIEW ]: new Set(), 		// Accessor hook, these can completely modify what gets returned and when
				[ Struct.Hooks.REDUCER ]: new Set(), 	// Pre-set, reducer hook -- if a value is returned, it is assigned to target[ prop ] (i.e. scoped state)
				[ Struct.Hooks.EFFECT ]: new Set(), 		// Post-set, effect hook
				[ Struct.Hooks.DELETE ]: new Set(), 		// Post-delete hook
			},
		});

		/**
		 * Allow a space for metadata/config information
		 */
		Reflect.defineProperty(this, "__meta", {
			configurable: false,
			enumerable: false,
			writable: true,
			value: {},
		});

		/**
		 * Return a proxy that acts as the hookable trap for the Struct
		 */
		const proxy = new Proxy(this, {
			get: (target, prop) => {
				if(prop === "__hooks" || prop === "__meta") {
					return Reflect.get(target, prop);
				} else if(Reflect.ownKeys(target).includes(prop)) {
					let current = Reflect.get(target, prop);
					for(let fn of target.__hooks[ Struct.Hooks.VIEW ]) {
						const result = fn(target, prop, current);

						// Short-circuit execution and return substitute value
						if(result !== void 0) {
							return result;
						}
					}

					return current;
				}

				return Reflect.get(target, prop);
			},
			set: (target, prop, value) => {
				if(prop === "__hooks" || prop === "__meta") {
					return Reflect.set(target, prop, value);
				} else if(Reflect.ownKeys(target).includes(prop)) {
					let next = target[ prop ];
					for(let fn of target.__hooks[ Struct.Hooks.REDUCER ]) {
						next = fn(target, prop, next, value);
					}

					if(next !== void 0) {
						const result = Reflect.set(target, prop, next);

						for(let fn of target.__hooks[ Struct.Hooks.EFFECT ]) {
							fn(target, prop, next);
						}

						return result;
					}
				}

				return Reflect.set(target, prop, value);
			},
			deleteProperty: (target, prop) => {
				if(prop === "__hooks" || prop === "__meta") {
					return Reflect.deleteProperty(target, prop);
				} else if(Reflect.ownKeys(target).includes(prop)) {
					let result = true;
					for(let fn of target.__hooks[ Struct.Hooks.DELETE ]) {
						result = fn(target, prop);
					}

					if(result === false) {
						return target;
					}
				}

				return Reflect.deleteProperty(target, prop);
			},
		});

		this.upsert(state);

		return proxy;
	}

	[ Symbol.iterator ]() {
		var index = -1;
		var data = Object.entries(Object.entries(this).reduce((acc, [ key, value ]) => {
			if(key !== "__hooks" && key !== "__meta") {
				acc[ key ] = value;
			}
			return acc;
		}, {}));

		return {
			next: () => ({ value: data[ ++index ], done: !(index in data) })
		};
	};
	forEach(fn) {
		for(let [ key, value ] of this) {
			fn(key, value, this);
		}

		return this;
	}
	map(fn) {
		const results = [];
		for(let [ key, value ] of this) {
			results.push(fn(key, value, this));
		}

		return results;
	}
	filter(fn) {
		const results = [];
		for(let [ key, value ] of this) {
			if(fn(key, value, this) === true) {
				results.push(value);
			}
		}

		return results;
	}
	reduce(fn, initial) {
		let acc = initial;
		for(let [ key, value ] of this) {
			acc = fn(acc, value, key, this);
		}

		return acc;
	}

	//#region CRUD
	upsert(prop, value) {
		if(typeof prop === "object") {
			for(let [ key, value ] of Object.entries(prop)) {
				this.upsert(key, value);
			}
		} else {
			Reflect.set(this, prop, value);
		}

		return this;
	}
	remove(prop) {
		if(typeof prop === "object") {
			for(let key of Object.keys(prop)) {
				this.remove(key);
			}
		} else {
			Reflect.deleteProperty(this, prop);
		}

		return this;
	}
	//#endregion CRUD
};

export default Struct;