import { v4 as uuid } from "uuid";

export class AgencyBase {
	constructor({ id, tags = [] } = {}) {
		this.id = id || uuid();
		this.tags = new Set(tags);

		return this;
	}

	toString() {
		return JSON.stringify(this);
	}
	toJson() {
		return JSON.stringify(this.toString());
	}
	toObject() {
		return {
			...this,
		};
	}
};

export default AgencyBase;