import { v4 as uuid } from "uuid";

export class Struct {
	static Hooks = {
		//? Allow for universal values to invoke short-circuits in the proxy traps (e.g. prevent update, change accessor return value, etc.)
		Abort: "74c80a9c-46c5-49c3-9c9b-2946885ee733",

		VIEW: "view",
		REDUCER: "reducer",
		EFFECT: "effect",
		DELETE: "delete",
	};
	constructor ({ id } = {}) {
		this.id = id || uuid();

		Reflect.defineProperty(this, "_hooks", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: {
				//? These are proxy hooks that affect how the Component behaves, in general (e.g. Accessor hook to return value from an API)
				[ Struct.Hooks.VIEW ]: new Set(), 		// Accessor hook, these can completely modify what gets returned and when
				[ Struct.Hooks.REDUCER ]: new Set(), 	// Pre-set, reducer hook -- if a value is returned, it is assigned to target[ prop ] (i.e. scoped state)
				[ Struct.Hooks.EFFECT ]: new Set(), 		// Post-set, effect hook
				[ Struct.Hooks.DELETE ]: new Set(), 		// Post-delete hook
			},
		});
		Reflect.defineProperty(this, "_meta", {	//? Allow a space for metadata/config information
			configurable: false,
			enumerable: false,
			writable: true,
			value: {},
		});

		const proxy = new Proxy(this, {
			get: (target, prop) => {
				let current = Reflect.get(target, prop);
				for(let fn of target._hooks[ Struct.Hooks.VIEW ]) {
					const result = fn(target, prop, current);

					// Short-circuit execution and return substitute value
					if(result !== void 0) {
						return result;
					}
				}

				return current;
			},
			set: (target, prop, value) => {
				let next = Reflect.get(target, prop);
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

				return Reflect.set(target, prop, value);
			},
			deleteProperty: (target, prop) => {
				for(let fn of target._hooks[ Struct.Hooks.DELETE ]) {
					fn(target, prop, current);
				}

				return Reflect.deleteProperty(target, prop);
			},
		});

		return proxy;
	}

    [ Symbol.iterator ]() {
        return Object.entries(this).entries();
    }
	forEach(fn) {
		for(let [ key, value ] of this) {
			fn(key, value, this);
		}
		
		return this;
	}

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
}

export default Struct;