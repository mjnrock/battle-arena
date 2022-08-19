import { Identity } from "./../../lib/Identity";

export class Events extends Identity {
	constructor (events, { ...rest } = {}) {
		super({ ...rest })

		this.events = new Map();

		this.addObject(events);
	}

	addObject(obj) {
		let iter;
		if(Array.isArray(obj)) {
			iter = obj;
		} else if(typeof obj === "object") {
			iter = Object.entries(obj);
		}

		if(iter) {
			iter.forEach(([ key, listener ]) => {
				if(Array.isArray(listener)) {
					listener.forEach(listener => this.add(key, listener));
				} else {
					this.add(key, listener);
				}
			});
		}
	}

	add(event, listener) {
		if(!this.events.get(event)) {
			this.events.set(event, new Set());
		}

		if(typeof listener === "function") {
			this.events.get(event).add(listener);

			return true;
		}

		return false;
	}

	on(event, listener) {
		return this.add(event, listener);
	}
	off(listener) {
		return this.remove(listener);
	}

	remove(event, listener) {
		return this.events.get(event).delete(listener);
	}
	removeAll(event) {
		this.events.get(event).clear();

		return true;
	}

	has(event) {
		return this.events.has(event);
	}
	isEmpty() {
		return this.events.size === 0;
	}

	emit(event, ...args) {
		let results = [];

		if(this.events.has(event)) {
			this.events.get(event).forEach(listener => {
				results.push(listener(...args));
			});
		}

		return results;
	}

	copy() {
		const copy = new Events();

		copy.events = new Map(this.events);

		return copy;
	}
};

export default Events;