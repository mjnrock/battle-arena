import { v4 as uuid } from "uuid";

export class Agent {
	static ControlCharacter = (command = ``) => command.length ? `#${ command }` : `#`;

	constructor ({ id, state = {}, triggers = {} } = {}) {
		this.id = id || uuid();
		this.state = {};
		this.triggers = new Map();

		this.setState(state);

		if(Array.isArray(triggers)) {
			this.addTriggerArray(triggers);
		} else if(typeof triggers === "object") {
			this.addTriggerObject(triggers);
		}
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

	//NOTE: These trigger/handler helper functions are all over the place

	addTrigger(trigger, ...handlers) {
		if(!this.triggers.has(trigger)) {
			this.triggers.set(trigger, new Set());
		}

		const set = this.triggers.get(trigger);
		for(let handler of handlers) {
			if(typeof handler === "function" || handler instanceof Agent) {
				set.add(handler);
			}
		}

		return this;
	}
	addTriggerArray(array = []) {
		for(let [ trigger, ...handlers ] of array) {
			if(Array.isArray(handlers[ 0 ])) {
				this.addTrigger(trigger, ...handlers[ 0 ]);
			} else {
				this.addTrigger(trigger, ...handlers);
			}
		}

		return this;
	}
	addTriggerObject(object = {}) {
		for(let [ trigger, ...handlers ] of Object.entries(object)) {
			if(Array.isArray(handlers[ 0 ])) {
				this.addTrigger(trigger, ...handlers[ 0 ]);
			} else {
				this.addTrigger(trigger, ...handlers);
			}
		}

		return this;
	}
	addHookObject(hooks = {}) {
		for(let [ hook, handler ] of Object.entries(hooks)) {
			if(typeof handler === "function") {
				handler = [ handler() ];
			} else if(Array.isArray(handler)) {
				// NOOP
			} else {
				handler = [ handler ];
			}

			if(hook[ 0 ] === Agent.ControlCharacter()) {
				this.addTrigger(hook, ...handler);
			} else {
				this.addTrigger(hook, ...handler);
			}
		}
	}

	removeTrigger(trigger) {
		if(this.triggers.has(trigger)) {
			this.triggers.delete(trigger);
		}

		return this;
	}
	removeTriggers(...triggers) {
		for(let trigger of triggers) {
			this.removeTrigger(trigger);
		}

		return this;
	}
	clearTriggers() {
		this.triggers.clear();

		return this;
	}

	removeHandler(trigger, handler) {
		if(this.triggers.has(trigger)) {
			const set = this.triggers.get(trigger);

			if(set.has(handler)) {
				set.delete(handler);
			}
		}

		return this;
	}
	removeHandlers(trigger, ...handlers) {
		if(!this.triggers.has(trigger)) {
			return this;
		}

		const set = this.triggers.get(trigger);
		for(let handler of handlers) {
			if(set.has(handler)) {
				set.delete(handler);
			}
		}

		return this;
	}
	clearHandlers(trigger) {
		if(this.triggers.has(trigger)) {
			this.triggers.get(trigger).clear();
		}

		return this;
	}

	/**
	 * A function that iterates and executes all handler for a given @trigger.
	 */
	trigger(trigger, ...args) {
		let result;

		if(Array.isArray(trigger)) {
			for(let [ trig, ...args ] of trigger) {
				result = this.trigger(trig, ...args);
			}

			return result;
		}

		if(this.triggers.has(trigger)) {
			const set = this.triggers.get(trigger);
			let nextResult = result;

			if(typeof trigger === "string" && trigger.startsWith(Agent.ControlCharacter())) {
				const [ invokingTrigger, ...newArgs ] = args;	// Command invocations should always pass the invoking trigger as the first argument in @args, thus remove it.

				for(let handler of set) {
					if(typeof handler === "function") {
						nextResult = handler(...newArgs);
					} else if(handler instanceof Agent) {
						nextResult = handler.trigger(trigger, ...newArgs);
					}

					if(nextResult !== void 0) {
						result = nextResult;
					}
				}

			} else {
				result = this.state;

				for(let handler of set) {
					if(typeof handler === "function") {
						nextResult = handler(result, ...args);
					} else if(handler instanceof Agent) {
						nextResult = handler.trigger(trigger, ...args);
					}
					
					if(nextResult !== void 0) {
						result = nextResult;
					}
				}
			}
		}
		
		return result;
	}
	/**
	 * An explicitly-defined async version of << .trigger >>, that is otherwise identical.
	 * 
	 * A function that iterates and executes all handler for a given @trigger.
	 */
	async asyncTrigger(trigger, ...args) {
		let result;

		if(this.triggers.has(trigger)) {
			const set = this.triggers.get(trigger);

			for(let handler of set) {
				if(typeof handler === "function") {
					result = await handler(...args);
				} else if(handler instanceof Agent) {
					result = await handler.asyncTrigger(trigger, ...args);
				}
			}
		}

		return await Promise.resolve(result);
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
		const mutatorResult = this.trigger(Agent.ControlCharacter(`mutator`), trigger, ...args);
		if(mutatorResult !== void 0) {
			args = mutatorResult;
		}

		//? Optionally short-circuit the event, if a filter hook returns << true >>
		const filterResult = this.trigger(Agent.ControlCharacter(`filter`), trigger, ...args);
		if(filterResult === true) {
			return;
		}

		//? Process the hooks, acting as a state reducer
		const oldState = this.state;
		let newState = this.trigger(trigger, ...args);
		if(newState === void 0) {
			newState = oldState;
		}
		const stateObj = { current: newState, previous: oldState, timestamp: Date.now() };
		if(oldState !== newState) {
			this.state = newState;

			//? Optionally broadcast the state change, passing the state object
			const updateResult = this.trigger(Agent.ControlCharacter(`update`), trigger, stateObj);
		}

		//? Optionally emit effect hooks, passing the state object
		const effectResult = this.trigger(Agent.ControlCharacter(`effect`), trigger, stateObj);

		return stateObj;
	}
	/**
	 * An explicitly-defined async version of << .emit >>, that is otherwise identical.
	 * 
	 * This method is a wrapper around << .asyncTrigger >> that will process several layers of
	 * middlerware before and after the actual invocation of the @trigger.  This method
	 * also prevents direct invocations of command triggers, whereas << .asyncTrigger >> does not.
	 * 
	 * This construction allows for:
	 * 	- Argument mutation (`mutator`)
	 *  - Short-circuit evaluation (`filter`)
	 *  - Update listening (`update`)
	 *  - Effect listening (`effect`)
	 */
	async asyncEmit(trigger, ...args) {
		if(typeof trigger === "string" && trigger[ 0 ] === Agent.ControlCharacter()) {
			return;
		}

		//?	Optionally mutate the passed @args
		const mutatorResult = await this.asyncTrigger(Agent.ControlCharacter(`mutator`), trigger, ...args);
		if(mutatorResult !== void 0) {
			args = mutatorResult;
		}

		//? Optionally short-circuit the event, if a filter hook returns << true >>
		const filterResult = await this.asyncTrigger(Agent.ControlCharacter(`filter`), trigger, ...args);
		if(filterResult === true) {
			return;
		}

		//? Process the hooks, acting as a state reducer
		const oldState = this.state;
		const newState = await this.asyncTrigger(trigger, ...args);
		const stateObj = { current: newState, previous: oldState, timestamp: Date.now() };
		if(oldState !== newState) {
			this.state = newState;

			//? Optionally broadcast the state change, passing the state object
			const updateResult = await this.asyncTrigger(Agent.ControlCharacter(`update`), trigger, stateObj);
		}

		//? Optionally emit effect hooks, passing the state object
		const effectResult = await this.asyncTrigger(Agent.ControlCharacter(`effect`), trigger, stateObj);

		return stateObj;
	}
};

export default Agent;