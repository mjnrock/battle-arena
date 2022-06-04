import { v4 as uuid } from "uuid";

export class AgencyBase {
	constructor({ id, tags = [] } = {}) {
		this.id = id || uuid();
		this.tags = new Set(tags);

		return this;
	}
};

export default AgencyBase;