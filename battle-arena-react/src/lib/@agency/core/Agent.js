import { v4 as uuid } from "uuid";

export class Agent {
	static ControlCharacter = (hook = ``) => {
		const char = `#`;

		if(hook[ 0 ] === char) {
			return hook;
		} else if(hook.length) {
			return `${ char }${ hook }`;
		}

		return char;
	}

	constructor ({ id, state = {}, events = {}, hooks = {} } = {}) {
		this.id = id || uuid();
		this.state = {};
		this.events = new Map();

		this.setState(state);
		
		this.addHooks(hooks);
		this.addEvents(events);
	}

	getState() {
		return this.state;
	}
	setState(state) {
		if(typeof state === "object") {
			this.state = state;
		}

		return this.getState();
	}
	mergeState(state = {}) {
		if(typeof state === "object") {
			this.state = {
				...this.state,
				...state,
			};
		}

		return this.getState();
	}

	addEvent(trigger, ...handlers) {
		if(!this.events.has(trigger)) {
			this.events.set(trigger, new Set());
		}

		if(Array.isArray(handlers[ 0 ])) {
			[ handlers ] = handlers;
		}

		const set = this.events.get(trigger);
		for(let handler of handlers) {
			if(typeof handler === "function" || handler instanceof Agent) {
				set.add(handler);
			}
		}

		return this;
	}
	addEvents(object) {
		if(Array.isArray(object)) {
			return this.addEventsByEntries(object);
		} else if(typeof object === "object") {
			return this.addEventsByObject(object);
		}

		return this;
	}
	addEventsByEntries(triggers) {
		for(let [ trigger, handlers ] of triggers) {
			this.addEvent(trigger, handlers);
		}

		return this;
	}
	addEventsByObject(triggers) {
		for(let [ trigger, handlers ] of Object.entries(triggers)) {
			this.addEvent(trigger, handlers);
		}

		return this;
	}
	removeEvent(trigger) {
		if(this.events.has(trigger)) {
			this.events.delete(trigger);
		}

		return this;
	}
	removeEvents(...triggers) {
		for(let trigger of triggers) {
			this.removeEvent(trigger);
		}

		return this;
	}
	clearEvents() {
		this.events.clear();

		return this;
	}

	addHandler(trigger, handler) {
		return this.addEvent(trigger, handler);
	}
	addHandlers(trigger, ...handlers) {
		return this.addEvent(trigger, ...handlers);
	}
	removeHandler(trigger, handler) {
		if(this.events.has(trigger)) {
			const set = this.events.get(trigger);

			if(set.has(handler)) {
				set.delete(handler);
			}
		}

		return this;
	}
	removeHandlers(trigger, ...handlers) {
		if(!this.events.has(trigger)) {
			return this;
		}

		const set = this.events.get(trigger);
		for(let handler of handlers) {
			if(set.has(handler)) {
				set.delete(handler);
			}
		}

		return this;
	}
	clearHandlers(trigger) {
		if(this.events.has(trigger)) {
			this.events.get(trigger).clear();
		}

		return this;
	}

	addHook(hook, handler) {
		return this.addEvent(Agent.ControlCharacter(hook), handler);
	}
	addHooks(hook, ...handlers) {
		if(Array.isArray(hook)) {
			return this.addHooksByEntries(hook);
		} else if(typeof hook === "object") {
			return this.addHooksByObject(hook);
		}

		return this.addEvent(Agent.ControlCharacter(hook), ...handlers);
	}
	addHooksByEntries(hooks = []) {
		for(let [ hook, handlers ] of hooks) {
			this.addEvent(Agent.ControlCharacter(hook), handlers);
		}

		return this;
	}
	addHooksByObject(hooks = {}) {
		for(let [ hook, handlers ] of Object.entries(hooks)) {
			this.addEvent(Agent.ControlCharacter(hook), handlers);
		}

		return this;
	}

	/**
	 * A function that iterates and executes all handler for a given @trigger.
	 */
	hook(hook, trigger, args, result) {
		if(this.events.has(Agent.ControlCharacter(hook))) {
			const set = this.events.get(hook);

			for(let handler of set) {
				if(typeof handler === "function") {
					result = handler(result, ...args);
				} else if(handler instanceof Agent) {
					result = handler.hook(hook, trigger, args, result);
				}
				
				if(hook === Agent.ControlCharacter(`filter`)) {
					return result;
				}
			}
		}

		return result;
	}
	trigger(trigger, args, result = this.getState()) {
		if(this.events.has(trigger)) {
			const set = this.events.get(trigger);

			for(let handler of set) {
				if(typeof handler === "function") {
					result = handler(result, ...args);
				} else if(handler instanceof Agent) {
					result = handler.trigger(trigger, args, result);
				}
			}
		}

		return result;
	}
	/**
	 * This method is a wrapper around << .trigger >> that will process several layers of
	 * middlerware before and after the actual invocation of the @trigger.  This method
	 * also prevents direct invocations of command triggers, whereas << .trigger >> does not.
	 * 
	 * This construction allows for:
	 * 	- Argument mutation (`mutator`)
	 *  - Short-circuit evaluation (`filter`)
	 *  - Update listening (`update`)
	 *  - Effect listening (`effect`)
	 */
	emit(trigger, ...args) {
		if(typeof trigger === "string" && trigger[ 0 ] === Agent.ControlCharacter()) {
			return;
		}

		//?	Optionally mutate the passed @args
		const mutatorResult = this.hook(Agent.ControlCharacter(`mutator`), trigger, args);
		if(mutatorResult !== void 0) {
			args = mutatorResult;
		}

		//? Optionally short-circuit the event, if a filter hook returns << true >>
		const filterResult = this.hook(Agent.ControlCharacter(`filter`), trigger, args);
		if(filterResult === true) {
			return;
		}

		//? Process the hooks, acting as a state reducer
		const previous = this.getState();
		const next = this.trigger(trigger, args);

		if(next !== previous) {
			this.state = next;

			const payload = {
				id: uuid(),
				state: this.getState(),
				previous,
				emitter: this.id,
				trigger,
				args,
				timestamp: Date.now(),
			};

			//? Optionally broadcast the state change, passing the state object
			const updateResult = this.hook(Agent.ControlCharacter(`update`), trigger, [ payload ]);
		}

		//? Optionally emit effect hooks, passing the state object
		const effectResult = this.hook(Agent.ControlCharacter(`effect`), trigger, [ this.getState(), ...args ]);

		return this.getState();
	}
};

export default Agent;