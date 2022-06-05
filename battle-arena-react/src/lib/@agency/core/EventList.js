import { spreadFirstElementOrArray } from "../util/helper";

/**
 * This class is a container for pre-defined events and handlers.
 * Additionally, aliases may be used to map pre-defined events 
 * to the alias in the attaching Agent.  This allows the same handler
 * to be used under a different name, if needed.
 */
export class EventList extends AgencyBase {
	constructor(events, aliases = [], agencyBaseObj = {}) {
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

	addAlias(event, aliases) {
		if(typeof event === "object") {
			this.addAliasObject(event);
		} else {
			for(const alias of aliases) {
				this.aliases.set(event, alias);
			}
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
	attachEvent(agent, event) {		
		const alias = this.aliases.get(event) || event;
		const handlers = this.events.get(event);

		if(handlers) {
			agent.addHandlers(alias, ...handlers);

			return true;
		}

		return false;
	}
	attach(agent) {
		for(const event of this.events.keys()) {
			this.attachEvent(agent, event);
		}

		return this;
	}
	attachSome(agent, ...events) {
		events = spreadFirstElementOrArray(events);

		for(const event of events) {
			/**
			 * Because .attachEvent() checks the existence of an event,
			 * we can just call it without checking if it exists.
			 */
			this.attachEvent(agent, event);
		}

		return this;
	}
	
	detachEvent(agent, event) {
		const handlers = this.events.get(event) || [];

		agent.removeHandlers(event, ...handlers);

		return this;
	}
	detach(agent) {
		for(const event of this.events.keys()) {
			this.detachEvent(agent, event);
		}

		return this;
	}
	detachSome(agent, ...events) {
		events = spreadFirstElementOrArray(events);

		for(const event of events) {
			/**
			 * Because .detachEvent() checks the existence of an event,
			 * we can just call it without checking if it exists.
			 */
			this.detachEvent(agent, event);
		}

		return this;
	}
	//#endregion Agent Attachment
};

export default EventList;