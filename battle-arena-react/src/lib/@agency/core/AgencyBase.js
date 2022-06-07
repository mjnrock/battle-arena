import { v4 as uuid } from "uuid";

export class AgencyBase {
	constructor ({ id, tags = [], parent, children = [] } = {}) {
		this.id = id || uuid();
		this.tags = new Set(tags);

		this.parent = parent;
		this.children = new Set(children);

		return this;
	}

	addChild(child) {
		this.children.add(child);
		child.parent = this;

		return this;
	}
	removeChild(child) {
		this.children.delete(child);
		child.parent = null;

		return this;
	}
	addParent(parent) {
		this.parent = parent;
		parent.children.add(this);

		return this;
	}
	removeParent(parent) {
		this.parent = null;
		parent.children.delete(this);

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