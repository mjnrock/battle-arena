import { v4 as uuid } from "uuid";

export class Struct {
	static Hooks = {
		//? Allow for universal values to invoke short-circuits in the proxy traps (e.g. prevent update, change accessor return value, etc.)
		Abort: "74c80a9c-46c5-49c3-9c9b-2946885ee733",
	};

	/**
	 * @evaluateState = true will execute the value of the key-value-pair as such: value(proxy, key)
	 * This allows for state to be dynamically generated, both initially and on reseed
	 */
	constructor (state = {}, { evaluateState = false, id, hooks = {} } = {}) {
		this.id = id || uuid();
		
		Reflect.defineProperty(this, "$hooks", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: {
				//? These are proxy hooks that affect how the Component behaves, in general (e.g. Accessor hook to return value from an API)
				view: new Set(), 		// Accessor hook, these can completely modify what gets returned and when
				reducer: new Set(), 	// Pre-set, reducer hook -- if a value is returned, it is assigned to target[ prop ] (i.e. scoped state)
				effect: new Set(), 		// Post-set, effect hook
				delete: new Set(), 		// Post-delete hook
	
				...hooks, // Seed object
			},
		});
		Reflect.defineProperty(this, "$meta", {	//? Allow a space for metadata/config information
			configurable: false,
			enumerable: false,
			writable: true,
			value: {},
		});

		const proxy = new Proxy(this, {
			get: async (target, prop) => {
				let current = Reflect.get(target, prop);
				for(let fn of target.$hooks.view) {
					const result = await fn(target, prop, current);

					// Short-circuit execution and return substitute value
					if(result !== void 0) {
						return result;
					}
				}

				return current;
			},
			set: async (target, prop, value) => {
				let newValue = value;
				for(let fn of target.$hooks.reducer) {
					newValue = await fn(target, prop, value);

					if(newValue === Struct.Hooks.Abort) {
						return Struct.Hooks.Abort;
					}
				}

				const returnVal = Reflect.set(target, prop, newValue);

				for(let fn of target.$hooks.effect) {
					fn(target, prop, newValue);
				}

				return returnVal;
			},
			deleteProperty: async (target, prop) => {
				let shouldDelete = true;
				for(let fn of target.$hooks.delete) {
					shouldDelete = await fn(target, prop, shouldDelete);

					if(shouldDelete === Struct.Hooks.Abort) {
						return Struct.Hooks.Abort;
					}
				}

				if(!!shouldDelete) {
					return Reflect.deleteProperty(target, prop);
				}

				return false;
			},
		});

		proxy.upsert(state, evaluateState);

		return proxy;
	}

	[ Symbol.iterator ]() {
		var index = -1;
		var entries = Object.entries(this);
				
		return {
			next: () => {
				return {
					value: entries[ ++index ],
					done: index === entries.length,
				};
			},
		};
	}

	async upsert(state = {}, evaluateState = true) {
		for(let [ key, value ] of Object.entries(state)) {
			if(evaluateState === true && typeof value === "function") {
				this[ key ] = await value(this, key);
			} else {
				this[ key ] = value;
			}
		}

		return this;
	}
	delete(keys = []) {
		for(let key of keys) {
			delete this[ key ];
		}

		return this;
	}

	async repeat(fnName, iters = 1, ...args) {
		const fn = typeof fnName === "function" ? fnName : this[ fnName ];
		const results = [];

		if(typeof fn === "function") {
			for(let i = 0; i < iters; i++) {
				results.push(await fn.call(this, ...args));
			}
		}

		return results;
	}

	toArray(includeId = true) {
		const obj = {
			...this,
		};

		delete obj.$hooks;
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

		delete obj.$hooks;
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
		return JSON.stringify(this.toString(includeId));
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

	static FromObject(obj = {}, opts = {}, applyStructs = true) {
		const instance = new this({}, opts);
		const iterator = Array.isArray(obj) ? obj : Object.entries(obj);

		if(applyStructs) {
			for(let [ key, value ] of iterator) {
				if(Array.isArray(value)) {
					instance[ key ] = Struct.FromObject(value);
				} else if(typeof value === "object") {
					instance[ key ] = Struct.FromObject(value);
				} else {
					instance[ key ] = value;
				}
			}
		} else {
			for(let [ key, value ] of iterator) {
				instance[ key ] = value;
			}
		}

		return instance;
	}
	static FromJson(json, opts = {}, applyStructs = true) {
		let obj = json;
		while(typeof obj === "string" || obj instanceof String) {
			obj = JSON.parse(obj);
		}

		return this.FromObject(obj, opts, applyStructs);
	}
	static FromHierarchy(hierarchy, opts = {}, applyStructs = true) {
		const instance = new Struct({}, opts);
		const sortedHierarchy = hierarchy.sort(([ i, pi ], [ j, pj ]) => {
			return (pi + i) - (pj + j);
		});

		for(let [ i, pid, key, value ] of sortedHierarchy) {
			if(key === `$root`) {
				continue;
			} else if(key === `$struct`) {
				//TODO
			} else {
				instance[ key ] = value;
			}
		}

		return instance;
	}

	static Create(...args) {
		return new this(...args);
	}
	static Factory(qty = 1, fnOrObj, each) {
		// Single-parameter override for .Spawning one (1) this
		if(typeof qty === "function" || typeof qty === "object") {
			fnOrObj = qty;
			qty = 1;
		}

		let structs = [];
		for(let i = 0; i < qty; i++) {
			let struct = this.Create(
				typeof fnOrObj === "function" ? fnOrObj(i, qty) : fnOrObj,
			);

			structs.push(struct);

			if(typeof each === "function") {
				each(struct);
			}
		}

		return structs;
	}
}

export default Struct;