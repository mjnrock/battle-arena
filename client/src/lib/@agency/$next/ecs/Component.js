import AgencyBase from "../../core/AgencyBase";

export class Component extends AgencyBase {
	constructor (name, state = {}, { id, tags } = {}) {
		super({ id, tags });

		this.__name = name;
		for(let key in state) {
			this[ key ] = state[ key ];
		}

		if(!this.__name) {
			throw new Error("Component must have a name.");
		}
	}

	next(state = {}, ...args) {
		return new this.constructor(this.__name, {});
	}
	delta(state = {}, ...args) {
		return new this.constructor(this.__name, {
			...this,
			...state,
		});
	}
};

export default Component;