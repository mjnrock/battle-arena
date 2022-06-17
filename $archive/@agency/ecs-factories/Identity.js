import { v4 as uuid, validate } from "uuid";

import { singleOrArrayArgs } from "../util/helper";

export class Identity {
	static Comparators = {
		/**
		 * Single-comparison evaluators
		 */
		IsUndefined(input) {
			return input === void 0;
		},
		IsNull(input) {
			return input === null;
		},
		IsDefined(input) {
			return input != null;
		},
		IsBoolean(input) {
			return typeof input === "boolean";
		},
		IsNumber(input) {
			return typeof input === "number";
		},
		IsNumeric(input) {
			return !isNaN(parseFloat(input));
		},
		IsString(input) {
			return typeof input === "string" || input instanceof String;
		},
		IsSymbol(input) {
			return typeof input === "symbol";
		},
		IsSet(input) {
			return input instanceof Set;
		},
		IsMap(input) {
			return input instanceof Map;
		},
		IsArray(input) {
			return Array.isArray(input);
		},
		IsObject(input) {
			return input != null && typeof input === "object";
		},
		IsStrictObject(input) {
			return Object.getPrototypeOf(input) === Object.prototype;
		},
		IsFunction(input) {
			return typeof input === "function";
		},
		IsDate(input) {
			return input instanceof Date;
		},
		IsRegExp(input) {
			return input instanceof RegExp;
		},
		IsPromise(input) {
			return input instanceof Promise;
		},
		IsIterable(input) {
			return input != null && typeof input[Symbol.iterator] === "function";
		},
		IsUUID(input) {
			return validate(input);
		},
		IsIdentity(input) {
			return input instanceof Identity;
		},
		IsHierarchy(input) {
			if(Identity.Comparators.IsArray(input)) {
				return input.every(row => {
					return Identity.Comparators.IsArray(row) && row.length === 4	//NOTE: [ id, tags, data, children ]
						&& Identity.Comparators.IsNumeric(row[ 0 ])
						&& (Identity.Comparators.IsNumeric(row[ 1 ]) || Identity.Comparators.IsNull(row[ 1 ]));
				});
			}

			return false;
		},

		/**
		 * Complex comparators
		 */
		IsStringOrSymbol(input) {
			return Identity.Comparators.IsString(input) || Identity.Comparators.IsSymbol(input);
		},
		IsArrayOrSet(input) {
			return Identity.Comparators.IsArray(input) || Identity.Comparators.IsSet(input);
		},

		HasTag(input, tag) {
			return input.tags.has(tag);
		},
		HasTags(input, ...tags) {
			return tags.every(tag => input.tags.has(tag));
		},
	};

	constructor ({ id, tags = [] } = {}) {
		Reflect.defineProperty(this, "id", {
			enumerable: true,
			configurable: false,
			writable: true,
			value: Identity.Comparators.IsStringOrSymbol(id) ? id : uuid(),
		});
		Reflect.defineProperty(this, "tags", {
			enumerable: true,
			configurable: false,
			writable: true,
			value: new Set(Identity.Comparators.IsArrayOrSet(tags) ? tags : []),
		});
	}

	deconstructor() {}

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
			if(value instanceof Identity) {
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
			if(value instanceof Identity) {
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
	toHierarchy(includeId = true, entries = Object.entries(this), pid = 0, table = []) {
		let eid = pid + 1;
		const addRow = (id, pid, k, v) => {
			let newKey = k,
				newValue = v;

			
			if(typeof k === "symbol") {
				k = k.toString();
			} else if(!isNaN(newKey)) {
				newKey = +newKey;
			}
			
			if(typeof v === "symbol") {
				v = v.toString();
			} else if(typeof v === "boolean") {
				newValue = v;
			} else if(!isNaN(newValue)) {
				newValue = +newValue;
			}

			table.push([ id, pid, newKey, newValue ]);
		};
		
		if(pid === 0) {
			table.push([ 0, null, null, `$root` ]);
		}

		entries.forEach(([ key, value ], i) => {
			if(includeId === false && key === "id") {
				//NOOP
			} else {
				let type = false,
					newValue = value;

				if(newValue instanceof Identity) {
					type = `$agency.${ newValue.constructor.name.toLowerCase() }`;
					newValue = Object.entries(newValue);
				} else if(Array.isArray(newValue)) {
					type = `$array`;
					newValue = Object.entries(newValue);
				} else if(newValue instanceof Set) {
					type = `$set`;
					newValue = Array.from(newValue.values()).map((v, i) => [ i, v ]);
				} else if(newValue instanceof Map) {
					type = `$map`;
					newValue = Array.from(newValue.entries());
				} else if(typeof newValue === "object") {
					type = `$object`;
					newValue = Object.entries(newValue);
				}

				if(type) {					
					addRow(eid, pid, key, type);

					if(type.includes(`$agency`)) {
						[ eid, table ] = value.toHierarchy(includeId, newValue, eid, table);
					} else {
						[ eid, table ] = this.toHierarchy(includeId, newValue, eid, table);
					}
				} else {
					addRow(eid, pid, key, newValue);
					eid++;
				}
			}
		});

		if(pid !== 0) {
			return [
				eid,
				table
			];
		}

		return table;
		// return table.sort((a, b) => a[ 0 ] - b[ 0 ]);	// Sort by EID
		// return table.sort((a, b) => a[ 1 ] - b[ 1 ]);	// Sort by PID
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


	//#region Instantiation
	static Create(...args) {
		return new this(...args);
	}
	static Factory(qty = 1, args = [], each) {
		args = singleOrArrayArgs(args);

		const instances = [];
		for(let i = 0; i < qty; i++) {
			/**
			 * Allow for a callback to be passed in to modify the arguments, so that
			 * the factory can create dynamic arguments for each iteration.
			 */
			let newArgs = typeof args === "function" ? args(i) : args;

			const instance = this.Create(...newArgs);
			instances.push(instance);

			/**
			 * Optionally perform work on the instance after it has been created.
			 */
			if(typeof each === "function") {
				each(i, instance);
			}
		}

		return instances;
	}
	//#endregion Instantiation
};

export default Identity;