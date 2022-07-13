import Runner from "./Runner";

export class Collection {
	constructor (names = []) {
		this.runners = new Map();

		if(typeof names === "string") {
			/**
			 * If only one name is passed, create a runner for it.
			 */
			this.runners.set(names, new Runner(names));
		} else if(Array.isArray(names)) {
			/**
			 * If an array of names is passed, create runners for them.
			 */
			names.forEach(name => this.runners.set(name, new Runner(name)));
		} else if(typeof names === "object" && Object.keys(listeners).length) {
			/**
			 * If an object of names and listeners is passed, create runners for them
			 * and add the listeners.
			 */
			Object.keys(listeners).forEach(name => {
				const runner = new Runner(name);
				const listeners = listeners[ name ];

				if(Array.isArray(listeners)) {
					/**
					 * If the listeners are an array, add them all.
					 */
					listeners.forEach(listener => runner.add(listener));
				} else {
					/**
					 * If the listeners are a single listener, add it.
					 */
					runner.add(listeners);
				}

				/**
				 * Add the runner to the collection.
				 */
				this.runners.set(name, runner);
			});
		}
	}

	get(name) {
		return this.runners.get(name);
	}
	has(name) {
		return this.runners.has(name);
	}

	add(name, listener) {
		if(this.has(name)) {
			return this.get(name).add(listener);
		}

		return false;
	}
	addMany(name, ...listeners) {
		if(this.has(name)) {
			return listeners.map(listener => this.get(name).add(listener));
		}

		return false;
	}

	remove(name, listener) {
		if(this.has(name)) {
			return this.get(name).remove(listener);
		}

		return false;
	}
	removeAll(name) {
		if(this.has(name)) {
			return this.get(name).removeAll();
		}

		return false;
	}

	isEmpty(name) {
		if(this.has(name)) {
			return this.get(name).isEmpty();
		}

		return true;
	}

	run(name, ...args) {
		if(this.has(name)) {
			return this.get(name).run(...args);
		}

		return [];
	}

	copy() {
		const copy = new Collection();

		this.runners.forEach((runner, name) => copy.runners.set(name, runner.copy()));

		return copy;
	}
};

export default Collection;