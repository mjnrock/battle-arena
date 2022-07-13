export class Runner {
	constructor (name) {
		this.name = name;
		this.listeners = new Set();
	}

	add(listener) {
		if(typeof listener[ this.name ] === "function" && !this.has(listener)) {
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
		const results = this.listeners.map(listener => listener[ this.name ](...args));

		return results;
	}

	copy() {
		const copy = new Runner(this.name);

		copy.listeners = new Set(this.listeners);

		return copy;
	}
};

export default Runner;