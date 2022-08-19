import Identity from "../../lib/Identity";
import Events from "../relay/Events";

export class Node extends Identity {
	static EnumType = {
		NAMESPACE: 0,
		ENTITY: 1,
	};

	constructor ({ events, parent, children = [], state, type, ...rest } = {}) {
		super({ ...rest });

		this.type = type || Node.EnumType.NAMESPACE;
		this.state = state;
		this.events = new Events(events);
		this.children = [];
		this.parent = parent;

		this.addObject(children);

		this.events.add("pulse", (...args) => this.pulse(...args));
	}

	get isNamespace() {
		return this.type === Node.EnumType.NAMESPACE;
	}
	get isEntity() {
		return this.type === Node.EnumType.ENTITY;
	}

	addObject(obj) {
		if(Array.isArray(obj)) {
			obj.forEach(node => this.add(node));
		}
	}
	add(child) {
		child.parent = this;
		this.children.push(child);
	}
	remove(child) {
		if(typeof child === "number") {
			this.children.splice(child, 1);
		} else {
			this.children = this.children.filter(c => c !== child);
		}

		child.parent = null;
	}
	clear() {
		this.children.forEach(child => child.parent = null);
		this.children = [];
	}
	get(index) {
		return this.children[ index ];
	}
	has(child) {
		return this.children.includes(child);
	}
	set(index, node) {
		this.children[ index ] = node;
	}
	swap(i1, i2) {
		const temp = this.children[ i1 ];
		this.children[ i1 ] = this.children[ i2 ];
		this.children[ i2 ] = temp;
	}

	pulse() {
		console.log("woof.", this.id)
	}

	run(...args) {
		this.events.emit("pulse", this.state, ...args);

		const results = [];
		for(let child of this.children) {
			results.push(child.run(...args));
		}

		return results;
	}
	emit(event, ...args) {
		return this.events.emit(event, ...args);
	}
};

export default Node;