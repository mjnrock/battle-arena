import { Identity } from "../../lib/Identity";
import { MapSet } from "../MapSet";

/**
 * This is the main composition object for an Eventable.
 * Use this when you want to add eventable functionality
 * to an existing object.
 */
export const $Eventable = (self) => Object.assign(self, {
	/**
	 * The list of events to which listeners can be attached
	 */
	events: new MapSet(),

	/**
	 * Emit an event to all listeners
	 */
	emit(event, ...args) {
		const handlers = this.events.get(event);
		const results = [];

		if(handlers) {
			for(let handler of handlers) {
				results.push(handler(this.state, ...args));
			}
		}

		return results;
	},
});

/**
 * Use the Eventable when you want to add basic event functionality.
 * Listeners can be attached to an event and will be invoked when the event is emitted.
 */
export class Eventable extends Identity {
	constructor ({ events = {}, ...opts } = {}) {
		super({ ...opts });

		$Eventable(this);

		this.events.addObject(events);
	}
};

export default Eventable;