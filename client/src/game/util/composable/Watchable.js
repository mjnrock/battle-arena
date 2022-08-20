import { Identity } from "../../util/Identity";

/**
 * This is the main composition object for an Watchable.
 */
export const $Watchable = (self) => new Proxy(Object.assign(self, {
	/**
	 * The list of props to watch (use an array to watch all)
	 */
	watch: [],

	/**
	 * The list of subscribers
	 */
	watchers: new Set(),
}), {
	set(target, prop, value) {
		const oldValue = target[ prop ];
		const result = Reflect.set(target, prop, value);

		if(oldValue !== value) {
			if(target.watch.includes(prop) || target.watch.length === 0) {
				for(let watcher of target.watchers) {
					watcher(prop, value, oldValue);
				}
			}
		}

		return result;
	},
	deleteProperty(target, prop) {
		const oldValue = target[ prop ];
		const result = Reflect.deleteProperty(target, prop);

		if(target.watch.includes(prop) || target.watch.length === 0) {
			for(let watcher of target.watchers) {
				watcher(prop, void 0, oldValue);
			}
		}

		return result;
	},
});

/**
 * Like Observable, use the Watchable when you only want to subscribe to
 * "change" notifications of an object.  This will only fire when a "set" or
 * "delete" operation occurs.
 */
export class Watchable extends Identity {
	constructor ({ watchers, ...opts } = {}) {
		super({ ...opts });

		const proxy = $Watchable(this);

		proxy.watchers.addObject(watchers);

		return proxy;
	}
};

export default Watchable;