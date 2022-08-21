import { Identity } from "../Identity";

export class Invoker extends Identity {
	constructor (listeners = [], { ...rest } = {}) {
		super({ ...rest })

		this.listeners = new Set(listeners);
	}

	add(listener) {
		if(typeof listener === "function") {
			this.listeners.add(listener);

			return true;
		}

		return false;
	}

	remove(listener) {
		return this.listeners.delete(listener);
	}
	removeAll() {
		this.listeners.clear();

		return true;
	}

	has(listener) {
		return this.listeners.has(listener);
	}
	isEmpty() {
		return this.listeners.size === 0;
	}

	run(...args) {
		const results = Array.from(this.listeners).map(listener => listener(...args));

		return results;
	}
	
	async arun(...args) {
		const results = Array.from(this.listeners).map(listener => {
			return new Promise((resolve, reject) => {
				resolve(listener(...args));
			});
		});

		return Promise.all(results);
	}

	copy() {
		const copy = new Invoker(this.name);

		copy.listeners = new Set(this.listeners);

		return copy;
	}
};

export default Invoker;