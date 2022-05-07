import { v4 as uuid } from "uuid";

export class Struct {
	static Hooks = {		//? Allow for universal values to invoke short-circuits in the proxy traps (e.g. prevent update, change accessor return value, etc.)
		Abort: "74c80a9c-46c5-49c3-9c9b-2946885ee733",
	};

	/**
	 * @evaluateState = true will execute the value of the key-value-pair as such: value(proxy, key)
	 * This allows for state to be dynamically generated, both initially and on reseed
	 */
	constructor(state = {}, { evaluateState = false, id, hooks = {} } = {}) {
		this.id = id || uuid();
		this.$hooks = {					//? These are proxy hooks that affect how the Component behaves, in general (e.g. Accessor hook to return value from an API)
			get: new Set(),			// Accessor hook
			pre: new Set(),			// Pre-set hook
			post: new Set(),		// Post-set hook
			delete: new Set(),		// Post-delete hook

			...hooks,				// Seed object
		};

		const proxy = new Proxy(this, {
			get: (target, prop) => {
				let value = Reflect.get(target, prop);
				for(let fn of target.$hooks.get) {
					value = fn(target, prop, value);

					// Short-circuit execution and return substitute value
					if(value !== void 0) {
						return value;
					}
				}

				return value;
			},
			set: (target, prop, value) => {
				let newValue = value;
				for(let fn of target.$hooks.pre) {
					newValue = fn(target, prop, value);

					if(newValue === Struct.Hooks.Abort) {
						return Struct.Hooks.Abort;
					}
				}
				
				const returnVal = Reflect.set(target, prop, newValue);

				for(let fn of target.$hooks.post) {
					fn(target, prop, newValue);
				}

				return returnVal;
			},
			deleteProperty: (target, prop) => {
				let shouldDelete = true;
				for(let fn of target.$hooks.delete) {
					shouldDelete = fn(target, prop, shouldDelete);

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

		proxy._upsert(state, evaluateState);

		return proxy;
	}

	_upsert(state = {}, evaluateState = true) {
		for(let [ key, value ] of Object.entries(state)) {
			if(evaluateState === true) {
				if(typeof value === "function") {
					this[ key ] = value(this, key);
				}
			} else {
				this[ key ] = value;
			}
		}

		return this;
	}
	_delete(keys = []) {
		for(let key of keys) {
			delete this[ key ];
		}

		return this;
	}

	toObject(includeId = true) {
		const obj = {
			...this,
		};
		
		delete obj.$hooks;
		if(includeId === false) {
			delete obj.id;
		}

		return obj;
	}
	toJson(includeId = true) {
		return JSON.stringify(this.toObject(includeId));
	}

	static FromObject(obj = {}, opts = {}) {
		return new this(obj, opts);
	}
	static FromJson(json, opts = {}) {
		let obj = json;
		while(typeof obj === "string" || obj instanceof String) {
			obj = JSON.parse(obj);
		}

		return this.FromObject(obj, opts);
	}
};

export default Struct;