import Struct from "./Struct";

/**
 * A Component is a formalization of a piece of state, allowing for specific sets of
 * logic to be stored and handled within the Component.  As such, Components are
 * meant to be largely data stores, with all of the real work being performed by a
 * System.
 */
export class Component extends Struct {
	constructor (name, state = {}, { id, tags } = {}) {
		super(state, { id, tags });
		
		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: name,
		});		
		Reflect.defineProperty(this, "__args", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: [ name, { id: this.id, tags: this.tags } ],
		});

		if(typeof this.name !== "string" && !this.name.length) {
			throw new Error("Component @name must be a non-empty string");
		}
	}

	[ Symbol.iterator ]() {
		const data = Object.entries(this);
		let index = 0;

		return {
			next: function () {
				return { value: data[ ++index ], done: !(index in data) }
			}
		};
	}

	has(entity) {
		return entity.has(this.name);
	}

	next(...args) {
		if(args[ 0 ] instanceof Component) {
			const [ comp, name ] = args;

			return new this.constructor(name, comp);
		} else if(args.length) {
			return new this.constructor(...args);
		}

		return new this.constructor(...this.__args);
	}
};

export default Component;