import { v4 as uuid } from "uuid";
import AgencyBase from "./AgencyBase";

export class Agent extends AgencyBase {
	static ControlCharacter = (hook = ``) => {
		const char = `#`;

		if(hook[ 0 ] === char) {
			return hook;
		} else if(hook.length) {
			return `${ char }${ hook }`;
		}

		return char;
	};
	static Hooks = {
		MUTATOR: `mutator`,		//* Receives [ trigger, result, ...args ]
		FILTER: `filter`,		//* Receives [ trigger, result, ...args ]
		UPDATE: `update`,		//* Receives [ trigger, payload ]
		EFFECT: `effect`,		//* Receives [ trigger, agent, payload ]
		BATCH: `batch`,			//* Invokes UPDATE with [ BATCH, payload ] (payload.args = [], payload.trigger = BATCH)
		DESTROY: `destroy`,		//* Receives []
	};

	constructor ({ id, state = {}, events = {}, hooks = {}, config = {}, tags = [] } = {}) {
		super({ id, tags });
		
		this.state = {};
		this.events = new Map();

		this.config = {
			allowRPC: false,
			allowMultipleHandlers: true,

			queue: new Set(),
			batchSize: 1000,
			isBatchProcessing: false,

			...config,
		};

		this.setState(state);
		
		this.addHooks(hooks);
		this.addEvents(events);
	}

	deconstructor() {
		this.hook(Agent.Hooks.DESTROY);

		for(let key of Reflect.ownKeys(this)) {
			delete this[ key ];
		}
	}

	//#region State
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

	mergeConfig(config = {}, keyMustNotExist = false) {
		if(typeof config === "object") {
			for(let [ key, value ] of Object.entries(config)) {
				if(keyMustNotExist) {
					if(this.config[ key ] === undefined) {
						this.config[ key ] = value;
					}
				} else if(this.config.hasOwnProperty(key)) {
					this.config[ key ] = value;
				}
			}
		}

		return this.config;
	}
	assert(config, value = true) {
		if(this.config[ config ] === value) {
			return true;
		}

		return false;
	}
	//#endregion State

	//#region Events
	addEvent(trigger, ...handlers) {
		if(!this.events.has(trigger)) {
			this.events.set(trigger, new Set());
		}

		if(Array.isArray(handlers[ 0 ])) {
			[ handlers ] = handlers;
		}

		const set = this.events.get(trigger);
		if(!this.config.allowMultipleHandlers) {
			
			const [ handler ] = handlers;
			if(typeof handler === "function" || handler instanceof Agent) {
				this.clearHandlers(trigger);
				
				set.add(handler);
			}

			return this;
		}

		for(let handler of handlers) {
			if(typeof handler === "function" || handler instanceof Agent) {
				set.add(handler);
			}
		}

		return this;
	}
	get on() {
		return this.addEvent;
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
	get off() {
		return this.removeEvent;
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
	//#endregion Events

	//#region Hooks
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
	removeHook(hook) {
		return this.removeEvent(Agent.ControlCharacter(hook));
	}
	removeHooks(...hooks) {
		for(let hook of hooks) {
			this.removeHook(hook);
		}

		return this;
	}
	//#endregion Hooks

	//#region Events - Batch Processing
	/**
	 * Queueing does not support hooks, only triggers.
	 */
	queue(trigger, args) {
		if(this.config.isBatchProcessing) {
			this.config.queue.add([ trigger, args ]);
		}

		return this;
	}
	process(supressUpdates = true) {
		let result = this.getState();
		if(this.config.isBatchProcessing) {
			const queue = Array.from(this.config.queue);
			const batch = queue.splice(0, this.config.batchSize);
			
			for(let [ trigger, args ] of batch) {				
				result = this.__handleEmission(trigger, args, supressUpdates);
			}
			
			const previous = this.getState();
			this.setState(result);
			
			const payload = {
				id: uuid(),
				state: result,
				previous,
				emitter: this.id,
				trigger: Agent.Hooks.BATCH,
				args: [],
				timestamp: Date.now(),
			};
			const updateResult = this.hook(Agent.Hooks.UPDATE, Agent.ControlCharacter(Agent.Hooks.BATCH), [ payload ]);
			
			this.config.queue = new Set(queue);
		}

		return result;
	}

	clearQueue() {
		this.config.queue.clear();

		return this;
	}
	//#endregion Events - Batch Processing

	//#region Emission
	/**
	 * A function that iterates and executes all handler for a given @trigger.
	 */
	hook(hook, trigger, args = [], result) {
		hook = Agent.ControlCharacter(hook);

		if(this.events.has(hook)) {
			if(!Array.isArray(args)) {
				args = [ args ];
			}

			const set = this.events.get(hook);
			for(let handler of set) {
				if(hook === Agent.ControlCharacter(Agent.Hooks.MUTATOR) || hook === Agent.ControlCharacter(Agent.Hooks.FILTER)) {
					if(typeof handler === "function") {
						result = handler(trigger, result, ...args);
					} else if(handler instanceof Agent) {
						result = handler.hook(hook, trigger, args, result);
					}
					
					if(hook === Agent.ControlCharacter(Agent.Hooks.FILTER) && result === true) {
						return result;
					}
				} else {
					if(typeof handler === "function") {
						handler(trigger, ...args);
					} else if(handler instanceof Agent) {
						handler.hook(hook, trigger, args, result);
					}
				}
			}
		}

		return result;
	}
	
	rpc(name, ...args) {
		if(this.config.allowRPC === true) {
			if(!Array.isArray(args)) {
				args = [ args ];
			}

			if(name in this) {
				return this[ name ](...args);
			}
		}
	}
	trigger(trigger, args = [], state = this.getState()) {
		if(this.events.has(trigger)) {
			if(!Array.isArray(args)) {
				args = [ args ];
			}

			const set = this.events.get(trigger);

			for(let handler of set) {
				if(typeof handler === "function") {
					state = handler(state, ...args);
				} else if(handler instanceof Agent) {
					state = handler.trigger(trigger, args, state);
				}
			}
		} else {
			return this.rpc(trigger, ...args);
		}

		return state;
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

		if(this.config.isBatchProcessing) {
			return this.queue(trigger, args);
		}

		return this.__handleEmission(trigger, args);
	}
	__handleEmission(trigger, args, suppress = false) {
		//?	Optionally mutate the passed @args
		const mutatorResult = this.hook(Agent.Hooks.MUTATOR, trigger, args);
		if(mutatorResult !== void 0) {
			args = mutatorResult;
		}

		//? Optionally short-circuit the event, if a filter hook returns << true >>
		const filterResult = this.hook(Agent.Hooks.FILTER, trigger, args);
		if(filterResult === true) {
			return;
		}

		//? Process the hooks, acting as a state reducer
		const previous = this.getState();
		const next = this.trigger(trigger, args);

		const payload = {
			id: uuid(),
			state: next,
			previous,
			emitter: this.id,
			trigger,
			args,
			timestamp: Date.now(),
		};

		if(next !== previous) {
			this.setState(next);

			// Suppress the update if this is invoked by a batch process
			if(!suppress) {
				//? Optionally broadcast the state change, passing the state object
				const updateResult = this.hook(Agent.Hooks.UPDATE, trigger, [ payload ]);
			}
		}

		//? Optionally emit effect hooks, passing the state object
		const effectResult = this.hook(Agent.Hooks.EFFECT, trigger, [ payload ]);

		return this.getState();
	}
	//#endregion Emission

	//#region Serialization
	toObject(includeId = true) {
		const obj = {
			...this,
		};

		if(includeId === false) {
			delete obj.id;
		}

		return obj;
	}
	toString() {
		return JSON.stringify(this.toObject());
	}
	toJson() {
		return JSON.stringify(this.toString());
	}
	//#endregion Serialization

	//#region Instantiation
	static Create({ id, state = {}, events = {}, hooks = {}, config = {} } = {}) {
		return new this({ id, state, events, hooks, config });
	}
	static Factory(qty = 1, fnOrArgs = [], each) {
		// Single-parameter override for .Spawning one (1) this
		if(typeof qty === "function" || typeof qty === "object") {
			fnOrArgs = qty;
			qty = 1;
		}

		if(!Array.isArray(fnOrArgs)) {
			fnOrArgs = [ fnOrArgs ];	// Make sure @fnOrArgs is an Array (primarily a convenience overload for Entity Factory, but is useful elsewhere)
		}

		let agents = [];
		for(let i = 0; i < qty; i++) {
			let args = fnOrArgs;
			if(typeof fnOrArgs === "function") {
				args = fnOrArgs();
			}

			const agent = this.Create(...args);
			agents.push(agent);

			if(typeof each === "function") {
				each(agent);
			}
		}

		return agents;
	}
	//#endregion Instantiation
};

export default Agent;