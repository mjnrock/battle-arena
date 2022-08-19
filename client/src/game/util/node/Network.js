import { Identity } from "../../lib/Identity";
import { Events } from "../relay/Events";

export class Network extends Identity {
	constructor ({ nodes, state, events, ...rest } = {}) {
		super({ ...rest });

		this.state = state;
		this.events = new Events(events);

		this.nodes = new Map();
		this.addObject(nodes);
	}

	run(alias, ...args) {
		this.events.emit("pulse", alias, ...args);

		return this.nodes.get(alias).run(...args);
	}
	emit(alias, event, ...args) {
		return this.nodes.get(alias).emit(event, ...args);
	}

	addObject(obj) {
		if(Array.isArray(obj)) {
			obj.forEach(([ alias, node ]) => this.add(alias, node));
		} else if(typeof obj === "object") {
			Object.entries(obj).forEach(([ alias, node ]) => this.add(alias, node));
		}
	}
	add(alias, node) {
		this.nodes.set(alias, node);
	}
	remove(alias) {
		this.nodes.delete(alias);
	}
	get(alias) {
		return this.nodes.get(alias);
	}
	has(alias) {
		return this.nodes.has(alias);
	}
	isEmpty() {
		return this.nodes.size === 0;
	}
	clear() {
		this.nodes.clear();
	}
};

export default Network;