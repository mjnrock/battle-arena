import Bitwise from "./Bitwise";

/**
 * This adds "lookup" functions to an enumeration object
 */
export function Enumerator(items = {}, { asBitwise = false } = {}, { startAt = 0, step = 1, assigner } = {}) {
    let obj = {};
	
	if(Array.isArray(items)) {
		if(asBitwise === true) {
			for(let i = 0; i < Math.min(items.length, 32); i++) {
				obj[ items[ i ] ] = 1 << i;
			}
		} else {
			for(let i = 0; i < items.length; i++) {
				if(typeof assigner === "function") {
					obj[ items[ i ] ] = assigner(i, items[ i ], { items, enum: obj });
				} else {
					obj[ items[ i ] ] = (step * i) + startAt;
				}
			}
		}
	} else {
		obj = {
			...items,
		};
    }

	if(asBitwise === true) {

		obj.flagToName = (flag) => {
			for(let name in obj) {
				if(obj[ name ] === flag) {
					return name;
				}
			}
	
			return null;
		}
		obj.maskToNames = (mask) => {
			let names = [];
	
			for(let name in obj) {
				if(Bitwise.has(mask, obj[ name ])) {
					names.push(name);
				}
			}
	
			return names;
		}

		obj[ Symbol.iterator ] = function() {
			var index = -1;
			var data = Object.entries(obj).reduce((p, [ k, v ]) => {
				if(k !== "flagToName" && k !== "maskToNames") {
					return [ ...p, [ k, v ]];
				}
	
				return p;
			}, []);
	
			return {
				next: () => ({ value: data[ ++index ], done: !(index in data) })
			};
		}
	} else {
		obj[ Symbol.iterator ] = function() {
			var index = -1;
			var data = Object.entries(obj);
	
			return {
				next: () => ({ value: data[ ++index ], done: !(index in data) })
			};
		}
	}

    return Object.freeze(obj);
};

export default Enumerator;