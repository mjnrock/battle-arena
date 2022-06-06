import AgencyBase from "../AgencyBase";

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
		Reflect.defineProperty(this, "_hooks", {
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
		Reflect.defineProperty(this, "_meta", {
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
				if(prop === "_hooks" || prop === "_meta") {
					return Reflect.get(target, prop);
				} else if(Reflect.ownKeys(target).includes(prop)) {
					let current = Reflect.get(target, prop);
					for(let fn of target._hooks[ Struct.Hooks.VIEW ]) {
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
				if(prop === "_hooks" || prop === "_meta") {
					return Reflect.set(target, prop, value);
				} else if(Reflect.ownKeys(target).includes(prop)) {
					let next = target[ prop ];
					for(let fn of target._hooks[ Struct.Hooks.REDUCER ]) {
						next = fn(target, prop, next, value);
					}

					if(next !== void 0) {
						const result = Reflect.set(target, prop, next);

						for(let fn of target._hooks[ Struct.Hooks.EFFECT ]) {
							fn(target, prop, next);
						}

						return result;
					}
				}

				return Reflect.set(target, prop, value);
			},
			deleteProperty: (target, prop) => {
				if(prop === "_hooks" || prop === "_meta") {
					return Reflect.deleteProperty(target, prop);
				} else if(Reflect.ownKeys(target).includes(prop)) {
					for(let fn of target._hooks[ Struct.Hooks.DELETE ]) {
						fn(target, prop);
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
			if(key !== "_hooks" && key !== "_meta") {
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
	find(input, { firstMatchOnly = false, regexOnKey = true, regexOnValue = false } = {}) {
		const results = [];
		if(input in this) {
			results.push(this[ input ]);
		} else if(typeof input === "function") {
			for(let [ key, value ] of this) {
				if(input(key, value, this) === true) {					
					if(firstMatchOnly) {
						return value;
					}

					results.push(value);
				}
			}
		} else if(input instanceof RegExp) {
			for(let [ key, value ] of this) {
				if(regexOnKey && input.test(key)) {
					if(firstMatchOnly) {
						return value;
					}

					results.push(value);
				}
				//FIXME
				// else if(regexOnValue && (typeof value === "string" || typeof value === "number") && input.test(value.toString())) {
				// 	if(firstMatchOnly) {
				// 		return value;
				// 	}

				// 	results.push(value);
				// }
			}
		}

		return results;
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

	//#region Serialization
	toArray(includeId = true) {
		const obj = {
			...this,
		};

		delete obj._hooks;
		if(includeId === false) {
			delete obj.id;
		}

		return Object.entries(obj).map(([ key, value ]) => {
			if(value instanceof Struct) {
				return [ key, value.toArray(includeId) ];
			}

			return [ key, value ];
		});
	}
	toObject(includeId = true) {
		const obj = {
			...this,
		};

		delete obj._hooks;
		if(includeId === false) {
			delete obj.id;
		}

		return Object.entries(obj).reduce((a, [ key, value ]) => {
			if(value instanceof Struct) {
				return { [ key ]: value.toObject(includeId), ...a };
			}
			
			return { [ key ]: value, ...a };
		}, {});
	}
	toString(includeId = true) {
		return JSON.stringify(this.toObject(includeId));
	}
	toJson(includeId = true) {
		return this.toString(includeId);
	}
	toHierarchy(includeId = true, pid = 0, ...recurseArgs) {
		const [ isRecursion ] = recurseArgs;

		let table = [];
		let i = pid + 1;

		if(!isRecursion) {
			table.push([ 0, null, "$root", null ]);
		}

		for(let [ key, value ] of Object.entries(this)) {
			let rows = [];
			if(value instanceof Struct) {
				rows.push([ i, pid, "$struct", key ]);

				const [ resultTable, j ] = value.toHierarchy(includeId, i, true);
				rows = [
					...rows,
					...resultTable,
				];

				i = j;
			} else {
				rows.push([ i, pid, key, value ]);
				
				i++;
			}
			

			table = [
				...table,
				...rows,
			];
		}

		if(isRecursion) {
			return [
				table,
				i,
			];
		}

		return table;
	}
	to(format, ...args) {
		switch(format) {
			case "array":
				return this.toArray(...args);
			case "object":
				return this.toObject(...args);
			case "string":
				return this.toString(...args);
			case "json":
				return this.toJson(...args);
			case "hierarchy":
				return this.toHierarchy(...args);
			default:
				return false;
		}
	}
	//#endregion Serialization
};

export default Struct;