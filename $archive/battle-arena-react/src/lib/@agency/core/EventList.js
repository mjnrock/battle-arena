import AgencyBase from "./AgencyBase";
import { coerceToIterable, singleOrArrayArgs, spreadFirstElementOrArray } from "../util/helper";

/**
 * This class is a container for pre-defined events and handlers.
 * Additionally, aliases may be used to map pre-defined events 
 * to the alias in the attaching Agent.  This allows the same handler
 * to be used under a different name, if needed.
 * 
 * The primary purpose of this class is to exist as an instantiable
 * compilation of event handlers (and aliases) that can be .attach-ed
 * to Agents.
 */
export class EventList extends AgencyBase {
	constructor (events, aliases = [], agencyBaseObj = {}) {
		super(agencyBaseObj);

		/**
		 * Hold a pre-defined list of events and their handlers.
		 */
		this.events = new Map();

		/**
		 * Hold a pre-defined list of events and their alias.
		 */
		this.aliases = new Map();

		this.addEvent(events);
		this.addAlias(aliases);
	}

	//#region Event And Alias Manipulation
	addEvent(event, ...handlers) {
		handlers = spreadFirstElementOrArray(handlers);

		if(typeof event === "object") {
			const entries = Array.isArray(event) ? event : Object.entries(event);
			for(const [ event, handler ] of entries) {
				this.addEvent(event, handler);
			}
		} else {
			for(const handler of handlers) {
				if(!this.events.has(event)) {

					//FIXME Ensure that Agent can consume a Set (cf. Array)

					this.events.set(event, new Set());
				}

				this.events.get(event).add(handler);
			}
		}

		return this;
	}
	removeEvent(event, ...handlers) {
		handlers = spreadFirstElementOrArray(handlers);

		if(typeof event === "object") {
			const entries = Array.isArray(event) ? event : Object.entries(event);
			for(const [ event, handler ] of entries) {
				this.removeEvent(event, handler);
			}
		} else {
			for(const handler of handlers) {
				if(this.events.has(event)) {
					return this.events.get(event).delete(handler);
				}
			}
		}

		return this;
	}

	addAlias(event, alias) {
		if(typeof event === "object") {
			this.addAliasObject(event);
		} else {
			this.aliases.set(event, alias);
		}

		return this;
	}
	addAliasObject(obj) {
		const entries = Array.isArray(obj) ? obj : Object.entries(obj);

		for(const [ event, ...aliases ] of entries) {
			this.addAlias(event, ...aliases);
		}

		return this;
	}
	removeAlias(...events) {
		for(const event of events) {
			if(!this.aliases.delete(event)) {
				return false;
			}
		}

		return true;
	}
	//#endregion Event And Alias Manipulation

	//#region Agent Attachment
	/**
	 * Attach a specific event and associated handler to an @agent.
	 * 
	 * NOTE: @event must exist within this.events
	 */
	attachEvent(agent, event, alias) {
		const handlers = this.events.get(event);
		
		alias = alias ? alias : (this.aliases.get(event) || event);

		if(handlers) {
			agent.addHandlers(alias, ...handlers);

			return true;
		}

		return false;
	}
	attach(agent, aliases = {}) {
		for(const event of this.events.keys()) {
			const alias = aliases[ event ];

			this.attachEvent(agent, event, alias);
		}

		return this;
	}
	attachSome(agent, events = [], aliases = {}) {
		events = singleOrArrayArgs(events);

		for(const event of events) {
			const alias = aliases[ event ];
			/**
			 * Because .attachEvent() checks the existence of an event,
			 * we can just call it without checking if it exists.
			 */
			this.attachEvent(agent, event, alias);
		}

		return this;
	}

	detachEvent(agent, event, alias) {
		const handlers = this.events.get(event) || [];

		alias = alias ? alias : (this.aliases.get(event) || event);

		agent.removeHandlers(alias, ...handlers);

		if(!agent.hasHandlers(alias)) {
			agent.removeEvent(alias);
		}

		return this;
	}
	detach(agent, aliases = {}) {
		for(const event of this.events.keys()) {
			const alias = aliases[ event ];

			this.detachEvent(agent, event, alias);
		}

		return this;
	}
	detachSome(agent, events = [], aliases = {}) {
		events = singleOrArrayArgs(events);

		for(const event of events) {
			const alias = aliases[ event ];
			/**
			 * Because .attachEvent() checks the existence of an event,
			 * we can just call it without checking if it exists.
			 */
			this.detachEvent(agent, event, alias);
		}

		return this;
	}
	//#endregion Agent Attachment

	/**
	 * Using the .toEventObject method, the class can creates { event: this.toEventObject() }
	 * that can be used the seed argument on Agents to preload the event handlers.
	 *  
	 * NOTE that because .toEventObject() collapses the aliases into an object,
	 * it is not suitable for creating a true-copy persistence object.  That being said,
	 * you may be able to retrieve the original name of the function from the function itself,
	 * if it was a named function, as the alias only applies to the Map, but this is
	 * not without its caveats.
	 */
	toEventObject(aliases = {}, extraEvents = {}) {
		const obj = {};
		for(const [ event, handlers ] of this.events) {
			const alias = aliases[ event ] || this.aliases.get(event) || event;

			obj[ alias ] = Array.from(handlers);
		}

		for(const [ event, handlers ] of Object.entries(extraEvents)) {
			const alias = aliases[ event ] || event;

			obj[ alias ] = Array.from(coerceToIterable(handlers));	// NOOP if is already an iterable, else coerce to array
		}

		return obj;
	}

	/**
	 * This method is used to create a new EventList from a
	 * previously-created .toEventObject() object.
	 */
	static FromEventObject(obj) {
		const eventList = new EventList();

		for(const [ event, handlers ] of Object.entries(obj)) {
			eventList.addEvent(event, ...handlers);
		}

		return eventList;
	}
};

export default EventList;