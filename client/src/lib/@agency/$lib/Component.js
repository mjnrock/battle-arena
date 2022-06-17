import Identity from "./Identity";

export class Component extends Identity {
	constructor ({ name, id, tags } = {}) {
		super({ id, tags });

		Reflect.defineProperty(this, "name", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: name,
		});
	}

	[ Symbol.iterator ]() {
		return Object.entries(this)[ Symbol.iterator ]();
	}

	next(...args) {
		return this;
	}
	delta(state = {}, ...args) {
		return this;
	}

	/**
	 * Receive data from another Component
	 */
	receive({ namespace, event, data } = {}) {
		console.log(namespace, event, data);
	}
};

export default Component;