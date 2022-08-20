import { Identity } from "../Identity";
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
		const results = [];
		
		/**
		 * Activate handlers specific to that event
		 */
		const handlers = this.events.get(event);
		if(handlers) {
			for(let handler of handlers) {
				results.push(handler(event, ...args));
			}
		}

		/**
		 * If any global handlers are present, activate them.
		 * NOTE: These results are ignored.
		 */
		const globals = this.events.get("*");
		if(globals) {
			for(let handler of globals) {
				handler(event, ...args);
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