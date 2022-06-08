import AgencyBase from "../AgencyBase";

/**
 * A Component is a formalization of a piece of state, allowing for specific sets of
 * logic to be stored and handled within the Component.  As such, Components are
 * meant to be largely data stores, with all of the real work being performed by a
 * System.
 */
export class Component extends AgencyBase {
	constructor(name, { id, tags } = {}) {
		super(name, { id, tags });

		this._name = name;
		this._args = [];
	}

	_generator(...args) {
		if(args.length) {
			return new this.constructor(...args);
		}
		
		return new this.constructor(...this._args);
	}
};

export default Component;