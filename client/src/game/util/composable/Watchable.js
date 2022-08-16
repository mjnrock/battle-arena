import { Identity } from "../../lib/Identity";
import { MapSet } from "../MapSet";

/**
 * This is the main composition object for an Watchable.
 */
export const $Watchable = (self) => new Proxy(Object.assign(self, {
	/**
	 * The list of subscribers
	 */
	watchers: new MapSet(),
}), {
	set(target, prop, value) {
		const oldValue = target[ prop ];
		const result = Reflect.set(target, prop, value);

		if(oldValue !== value) {
			const watchers = target.watchers.get(prop);

			if(watchers) {
				for(let watcher of watchers) {
					watcher(prop, value, oldValue);
				}
			}
		}

		return result;
	},
	deleteProperty(target, prop) {
		const oldValue = target[ prop ];
		const result = Reflect.deleteProperty(target, prop);

		const watchers = target.watchers.get(prop);
		if(watchers) {
			for(let watcher of watchers) {
				watcher(prop, void 0, oldValue);
			}
		}

		return result;
	}
});

/**
 * Like Observable, use the Watchable when you only want to subscribe to
 * "change" notifications of an object.  This will fire when a "set" or
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