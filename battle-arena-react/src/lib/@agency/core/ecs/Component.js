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

		this.name = name;
		this.args = [ name, { id: this.id, tags: this.tags } ];	//FIXME Uncomment
	}

	generator(...args) {
		if(args.length) {
			return new this.constructor(...args);
		}

		return new this.constructor(...this.args);
	}
};

export default Component;