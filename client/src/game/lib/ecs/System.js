import Identity from "../Identity";
import Runner from "../../util/relay/Runner";


/**
 * A convenience method for running a fn against a collection of entities,
 * passing each entity, along with the args, to the fn.
 */
export function each(entities, fn, ...args) {
	const results = [];
	for(let entity of entities) {
		results.push(fn(entity, ...args));
	}

	return results;
};

/**
 * The System is the primary means of modifying the Component-state
 * on an Entity.  All modifications should be driven by the events
 * system, which will invoke the event-handler of each listener.  As
 * such, the System is intended to be used as a message system, which
 * can be routed by an Environment's .dispatch method.
 */
export class System extends Identity {
	constructor ({ handlers = {}, id, tags, name } = {}) {
		super({ id, tags });

		/**
		 * The name of the System and the name of the Component key it expects to find
		 */
		this.name = name;

		/**
		 * The System subscribes itself to the Runners, receiving the payload when .emitted to the .handler[ event ] Runner.
		 * Since this is a [ key, Runner(key) ] map, any additional listeners that may want to subscribe to System .emitted events
		 * can do so.
		 */
		this.events = new Map();

		for(let [ key, handler ] of Object.entries(handlers)) {
			/**
			 * Add the event to the System, creating a new Runner to handle the event.
			 */
			this.add(key);

			if(typeof handler === "function") {
				/**
				 * If a function is also provided, make it the handler for the event for this System.
				 * This ensures, in these cases, that a handler is present for the given event.
				 */
				this[ key ] = handler;
			}
		}
	}

	/**
	 * Get the Component from the Entity
	 */
	get(entity) {
		if(entity.has(this.name)) {
			return entity.get(this.name);
		}

		return false;
	}
	/**
	 * Invoke Entity.update on the Entity, passing the new data
	 */
	set(entity, data) {
		entity.update(this.name, data);

		return entity;
	}


	/**
	 * Add a handler to the System
	 */
	add(...keys) {
		/**
		 * By adding << this >>, we subscribe the System
		 * to the Runner, which will run this[ key ] when
		 * the event is emitted.  Modify that method to
		 * alter its behavior.
		 */
		for(let key of keys) {
			this.events.set(key, new Runner(key, this));
		}

		return this;
	}
	/**
	 * Remove a handler from the System
	 */
	remove(key) {
		let runner = this.events.get(key);

		if(runner) {
			runner.removeAll();

			return this.events.delete(key);
		}

		return false;
	}
	/**
	 * Remove all handlers from the System
	 */
	clear() {
		for(let key of this.events.keys()) {
			this.remove(key);
		}

		this.events.clear();

		return this;
	}


	/**
	 * Assigns the this-bound @fn to the System under the @event key.
	 * This is primarily useful for adding handlers for which the System is responsible.
	 * 
	 * NOTE: If you don't want to bind @fn, use this.events.get(@event).add(@fn) to instead assign directly to the Runner.
	 */
	bind(event, fn) {
		if(!this.events.has(event)) {
			this.add(event);
		}

		this[ event ] = fn.bind(this);

		return this[ event ];
	}


	/**
	 * Emit an event to the System's Runner at the given event key
	 */
	emit(event, entities = [], ...args) {
		const runner = this.events[ event ];

		if(!runner) {
			return;
		}

		return runner.run(entities, ...args);
	}
};

export default System;