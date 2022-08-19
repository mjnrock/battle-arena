import { v4 as uuid } from "uuid";

import { singleOrArrayArgs } from "../util/helper";

export class AgencyBase {
	constructor ({ id, tags = [], parent, children = [] } = {}) {
		this.id = id || uuid();

		this.tags = new Set(singleOrArrayArgs(tags));

		// this.parent = parent;
		// this.children = new Set(children);

		return this;
	}

	//#region Graph Structure
	// addChild(child) {
	// 	this.children.add(child);
	// 	child.parent = this;

	// 	return this;
	// }
	// removeChild(child) {
	// 	this.children.delete(child);
	// 	child.parent = null;

	// 	return this;
	// }
	// addParent(parent) {
	// 	this.parent = parent;
	// 	parent.children.add(this);

	// 	return this;
	// }
	// removeParent(parent) {
	// 	this.parent = null;
	// 	parent.children.delete(this);

	// 	return this;
	// }
	//#endregion Graph Structure

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
			if(value instanceof AgencyBase) {
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
			if(value instanceof AgencyBase) {
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

				if(newValue instanceof AgencyBase) {
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
};

export default AgencyBase;