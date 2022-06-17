import Identity from "./Identity";

export class Component extends Identity {
	constructor ({ name, id, tags, next, delta, receive } = {}) {
		super({ id, tags });

		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: name,
		});

		if(typeof next === "function") {
			this.next = next;
		}
		if(typeof delta === "function") {
			this.delta = delta;
		}
		if(typeof receive === "function") {
			this.receive = receive;
		}
	}

	[ Symbol.iterator ]() {
		return Object.entries(this)[ Symbol.iterator ]();
	}

	/**
	 * Determine the next state of the Component, or optinally
	 * return a new Component instance
	 */
	next(...args) {
		return this;
	}

	/**
	 * A merge-equivalent of the next() method
	 */
	delta(state = {}, ...args) {
		return this;
	}

	/**
	 * Receive data from another Component
	 */
	receive({ namespace, event, data } = {}) {}
};

export default Component;