import Identity from "./Identity";

export class Component extends Identity {
	constructor ({ name, id, tags, next, delta, receive } = {}) {
		super({ id, tags });

		/**
		 * Create a hidden property to uniquely identify the Component.
		 * Once set, it cannot be changed; to change it, create a new
		 * Component instance.
		 */
		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: name,
		});

		/**
		 * Provide override assignments, if any
		 */
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

	/**
	 * Allow the Component to be iterated over by its key-value pairs.
	 */
	[ Symbol.iterator ]() {
		return Object.entries(this)[ Symbol.iterator ]();
	}

	/**
	 * Determine the next state of the Component, or optinally
	 * return a new Component instance.
	 */
	next(...args) {
		return this;
	}
	/**
	 * A merge-equivalent of the next() method.
	 */
	delta(state = {}, ...args) {
		return this;
	}

	/**
	 * Receive data from the Entity.
	 */
	receive({ namespace, event, data, state: entityState, ...rest } = {}) {}
};

export default Component;