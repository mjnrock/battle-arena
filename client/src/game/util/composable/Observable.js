import { Identity } from "../../util/Identity";

/**
 * This is the main composition object for an Observable.
 */
export const $Observable = (self) => new Proxy(Object.assign(self, {
	/**
	 * What the Observable will be watching
	 */
	observe: {
		/**
		 * The list of properties to watch (use an empty array to watch all)
		 */
		props: [],

		/**
		 * By default, don't emit "READ" signals
		 */
		READ: false,
		INSERT: true,
		UPDATE: true,
		DELETE: true,
	},

	/**
	 * The list of subscribers
	 */
	observers: new Set(),

	/**
	 * The main function to signal any observer that an event has occurred.
	 */
	signal(operation, prop, value, oldValue) {
		for(let observer of this.observers) {
			observer(operation, prop, value, oldValue);
		}
	},
}), {
	//TODO: Add support for nested Observables and namespaced signals in such cases (e.g. [ "UPDATE", "foo.bar.baz", ... ])

	get(target, prop) {
		const result = Reflect.get(target, prop);

		if(target.observe.READ && (target.observe.props.includes(prop) || target.observe.props.length === 0)) {
			target.signal("READ", prop, result);
		}

		return result;
	},
	set(target, prop, value) {
		const oldValue = target[ prop ];
		const result = Reflect.set(target, prop, value);

		if(oldValue !== value) {
			let op = oldValue === void 0 ? "INSERT" : "UPDATE";

			if(target.observe[ op ] && (target.observe.props.includes(prop) || target.observe.props.length === 0)) {
				target.signal(op, prop, value, oldValue);
			}
		}

		return result;
	},
	deleteProperty(target, prop) {
		const oldValue = target[ prop ];
		const result = Reflect.deleteProperty(target, prop);

		if(target.observe.DELETE && (target.observe.props.includes(prop) || target.observe.props.length === 0)) {
			target.signal("DELETE", prop, void 0, oldValue);
		}

		return result;
	}
});

/**
 * Use the Observable when you want to subscribe to the CRUD operations of an object.
 * This will fire when a "create", "read", "update", or "delete" operation occurs.
 */
export class Observable extends Identity {
	constructor ({ observers = [], ...opts } = {}) {
		super({ ...opts });

		const proxy = $Observable(this);

		observers.forEach(observer => proxy.observers.add(observer));

		return proxy;
	}
};

export default Observable;