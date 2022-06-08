import AgencyBase from "../AgencyBase";

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