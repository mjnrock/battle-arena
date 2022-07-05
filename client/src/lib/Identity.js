import { v4 as uuid } from "uuid";

export class Identity {
	constructor({ id, tags = [] } = {}) {
		this.id = id || uuid();
		this.tags = new Set(tags);
	}
};

export default Identity;