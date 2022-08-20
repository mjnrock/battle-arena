import { Identity } from "../../util/Identity";

/**
 * This is the main composition object for an Subscribable.
 * Use this when you want to add Subscribable functionality
 * to an existing object.
 */
export const $Subscribable = (self) => Object.assign(self, {
	/**
	 * The list of subscribers
	 */
	subscribers: new Set(),

	/**
	 * Invoke a particular subscriber, based on its index
	 */
	send(index, ...args) {
		const subscriber = Array.from(this.subscribers)[ index ];

		if(subscriber) {
			return subscriber(...args);
		}
	},

	/**
	 * Invoke all subscribers
	 */
	broadcast(...args) {
		const results = [];
		for(let subscriber of this.subscribers) {
			results.push(subscriber(...args));
		}

		return results;
	}
});

/**
 * Use the Subscribable when you want to subscribe to an object, receiving messages
 * only when invoked.  A subscriber is a function that will be invoked when either
 * the .send (1:1) or .broadcast (1:*) methods are invoked.
 */
export class Subscribable extends Identity {
	constructor ({ subscribers = {}, ...opts } = {}) {
		super({ ...opts });

		$Subscribable(this);

		this.subscribers.addObject(subscribers);
	}
};

export default Subscribable;