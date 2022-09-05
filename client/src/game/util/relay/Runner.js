export class Runner {
	constructor (name, ...listeners) {
		this.name = name;
		this.listeners = new Set();

		for(let listener of listeners) {
			this.add(listener);
		}
	}

	add(listener) {
		// if(typeof listener[ this.name ] === "function" && !this.has(listener)) {		`// Only let listeners that have the event method be added to the Runner.
		if(!this.has(listener)) {
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
		const results = Array.from(this.listeners).map(listener => listener[ this.name ](...args));

		return results;
	}

	copy() {
		const copy = new Runner(this.name);

		copy.tags = new Set(this.tags);
		copy.listeners = new Set(this.listeners);

		return copy;
	}
};

export default Runner;