import { v4 as uuid } from "uuid";
import Message from "./comm/Message";

export class Agent {
	static Hooks = {		//? Allow for universal values to invoke short-circuits in the proxy traps (e.g. prevent update, change accessor return value, etc.)
		Abort: "74c80a9c-46c5-49c3-9c9b-2946885ee733",		// If set hook returns this, prevent the update
	};

	constructor({ state = {}, triggers = [], config, namespace, id, globals = {}, hooks = {} } = {}) {
		this.id = id || uuid();
		this.state = state;
		this.triggers = new Map();
		this.config = {
			//* Agent config
			hooks: {					//? These are proxy hooks that affect how the Agent behaves, in general (e.g. Accessor hook to return value from an API)
				get: new Set(),			// Accessor hook
				pre: new Set(),			// Pre-set hook
				post: new Set(),		// Post-set hook
				delete: new Set(),		// Post-delete hook

				...hooks,				// Seed object
			},

			//*	Handler config
			generatePayload: true,			// If true, handlers will receive ([ ...args ], payload) or ([ msg ], payload), if false, handlers will receive (...args).  This allows for greater customization of an Agent's behavior (e.g GameLoop never needs a payload, but a Router always would to know sender)
			allowMultipleHandlers: true,	// Allow one (and only one -- overwrites will occur) handler per trigger (NOTE: This is intended to be set on and left alone after instantiation, and as such, this ONLY works on the .addTrigger/s functions (and seed triggers) -- .invoke contains no logic to check for this setting).  This is useful for creating Agent's where their intrinsic nature makes multiple handlers undesirable (e.g. GameLoop).
			isReducer: true,				// Make ALL triggers return a state -- to exclude a trigger from state, create a * handler that returns true on those triggers
			allowRPC: true,					// If no trigger handlers exist AND an internal method is named equal to the trigger, pass ...args to that method
			
			//* Batching config
			queue: new Set(),				// The repository for triggers when set to process in batches
			isBatchProcessing: false,		// The flag to determine if triggers should be batched or handled immediately
			maxBatchSize: 1000,				// The maximum quantity of triggers a single batch process will handle before terminating

			//* Trigger config
			namespace,						// An optional namespace for collisions and complex relationships
			notifyTrigger: "@update",		// The trigger that will be fired when .state is modified
			dispatchTrigger: "@dispatch",	// The trigger that will be fired when a trigger has been handled (and the Agent is NOT a reducer)
			
			//* Global context object
			globals: {						//? These will be added to all @payloads, if enabled
				...globals,
			},

			...config,						// Seed object
		};

		this.addTriggers(triggers);

		return new Proxy(this, {
			get: (target, prop) => {
				let value = Reflect.get(target, prop);
				for(let fn of target.config.hooks.get) {
					value = fn(target, prop, value);

					// Short-circuit execution and return substitute value
					if(value !== void 0) {
						return value;
					}
				}

				return value;
			},
			set: (target, prop, value) => {
				let newValue = value;
				for(let fn of target.config.hooks.pre) {
					newValue = fn(target, prop, value);

					if(newValue === Agent.Hooks.Abort) {
						return Agent.Hooks.Abort;
					}
				}
				
				const returnVal = Reflect.set(target, prop, newValue);

				for(let fn of target.config.hooks.post) {
					newValue = fn(target, prop, value);
				}

				return returnVal;
			},
			deleteProperty: (target, prop) => {
				let shouldDelete = true;
				for(let fn of target.config.hooks.delete) {
					shouldDelete = fn(target, prop, shouldDelete);

					if(shouldDelete === Agent.Hooks.Abort) {
						return Agent.Hooks.Abort;
					}
				}

				if(!!shouldDelete) {
					return Reflect.deleteProperty(target, prop);
				}

				return false;
			},
		});
	}

	deconstructor() {}


	/**
	 * Convenience function for toggling/altering configuration booleans -- must be a boolean
	 */
	toggle(configAttribute, newValue) {
		if(typeof this.config[ configAttribute ] === "boolean") {
			if(typeof newValue === "boolean") {	
				this.config[ configAttribute ] = newValue;
			} else {
				this.config[ configAttribute ] = !this.config[ configAttribute ];
			}
		}

		return this;
	}
	assert(configAttribute, expectedValue) {
		return this.config[ configAttribute ] === expectedValue;
	}

	getHandlers(trigger) {
		if(this.assert("allowMultipleHandlers", true)) {
			return this.triggers.get(trigger);
		
		}

		return this.triggers.get(trigger).values().next().value;
	}

	/**
	 * @trigger can be anything, not limited to strings
	 */
	addTrigger(trigger, ...handler) {
		if(this.assert("allowMultipleHandlers", false)) {
			const fn = [ ...handler, ...(this.triggers.get(trigger) || []) ].shift();
			const handlerSet = new Set([ fn ]);
	
			this.triggers.set(trigger, handlerSet);
		} else {
			let handlers = this.triggers.get(trigger) || new Set();
			
			for(let fn of handler) {
				if(typeof fn === "function") {
					handlers.add(fn);
				}
			}
	
			this.triggers.set(trigger, handlers);
		}

		return this;
	}
	addTriggers(addTriggerArgs = []) {
		if(typeof addTriggerArgs === "object") {
			if(Array.isArray(addTriggerArgs)) {
				for(let [ trigger, handlers ] of addTriggerArgs) {
					if(Array.isArray(handlers)) {
						this.addTrigger(trigger, ...handlers);
					} else {
						this.addTrigger(trigger, handlers);
					}
				}
			} else {
				for(let [ key, fn ] of Object.entries(addTriggerArgs)) {
					this.addTrigger(key, fn);
				}
			}
		}

		return this;
	}
	removeTrigger(trigger, ...handler) {
		let handlers = this.triggers.get(trigger);
		
		for(let fn of handler) {
			if(handlers instanceof Set) {
				return handlers.delete(fn);
			}
		}

		return false;
	}
	removeTriggers(removeTriggerArgs = []) {
		let results = [];
		for(let args of removeTriggerArgs) {
			results.push(this.removeTrigger(...args));
		}

		return results;
	}

	hasTrigger(trigger) {
		return this.triggers.has(trigger);
	}


	/**
	 * 
	 */
	__generatePayload({ id, trigger, args } = {}) {
		return [
			args,
			{
				pid: id,							// Payload ID, exists mainly for custom provenance/idempotency checks
				timestamp: Date.now(),				// Generation timestamp, for same reasons as pid

				namespace: this.config.namespace,	// An optional namespace for the handler to optionally utilize (exists for complex/collision scenarios)
				trigger: trigger,					// Pass a convenience reference of the trigger
				target: this,						// Pass a convenience reference of "this"
				state: this.state,					// Pass a convenience reference of state to handler
				invoke: this.invoke,				// Pass a convenience reference to invoke to easily chain-invoke
				
				...this.config.globals,				// Destructure Agent's globals into the payload
			}
		];
	}

	/**
	 * This should NOT be used externally.
	 * 
	 * A handling abstract to more easily deal with
	 * batching vs immediate invocations
	 */
	__handleInvocation(trigger, ...args) {
		// Prevent directly invoking specialty hooks
		if(typeof trigger === "string" && trigger[ 0 ] === "$") {
			return false;
		}
		
		// Many contingent handlers receive the same payload, so abstract it here
		let payload = this.assert("generatePayload", true) ? this.__generatePayload({ id: uuid(), trigger, args }) : args;
		/**
		 * ? Params hooks
		 * These will change the data/@arguments contained in the @payload.  Use these
		 * if you want to dynamically alter: @trigger, @args, or @payload.
		 * 
		 * NOTE: "Spoofing" is intentionally allowed -- apply necessary business logic
		 * NOTE: This does NOT spread the payload -- it takes and returns a direct payload
		 */
		for(let fn of (this.triggers.get("$params") || [])) {
			payload = fn(payload);
		}
		
		const handlers = this.triggers.get(trigger);
		if(trigger === this.config.notifyTrigger) {
			for(let handler of handlers) {
				handler(...payload);
			}
			
			return true;
		} else if(handlers.size === 0) {
			// Verify that the RPC has a landing method
			if(this.config.allowRPC === true && typeof trigger === "string" && typeof this[ trigger ] === "function") {
				this[ trigger ](...args);
				
				return true;
			}
			
			return false;
		}

		/**
		 * ? Pre hooks
		 * These act as filters iff one returns << true >> and will cease execution immediately (i.e. no handlers or effects will be processed)
		 */
		for(let fn of (this.triggers.get("$pre") || [])) {
			let result = fn(...payload);

			if(result === true) {
				return false;
			}
		}

		let invocationType;
		if(this.config.isReducer === true) {
			invocationType = this.config.notifyTrigger;

			let next = this.state;
			for(let handler of handlers) {
				const last = next;

				next = handler(payload[ 0 ], {
					state: next,
					...payload[ 1 ],
				});

				if(next === void 0) {
					next = last;
				}
			}

			
			const oldState = this.state;
			this.state = next;
			
			if(Object.keys(this.state).length && oldState !== this.state) {
				this.invoke(invocationType, { current: next, previous: oldState });
			}
		} else {
			invocationType = this.config.dispatchTrigger;

			for(let handler of handlers) {
				handler(...payload);
			}
			
			this.invoke(invocationType, { current: this.state });
		}

		/**
		 * ? Post hooks
		 * Treat these like Effects
		 */
		for(let fn of (this.triggers.get("$post") || [])) {
			fn(invocationType, ...payload);
		}

		return true;
	}
	__handleMessage(msg) {
		if(Message.Conforms(msg)) {
			const lockedMessage = Message.Copy(msg, true);
	
			lockedMessage.info.isLocked = true;
	
			return this.__handleInvocation(lockedMessage.type, lockedMessage);
		}

		return false;
	}

	/**
	 * Synonym for .invoke
	 */
	get trigger() {
		return this.invoke;
	}
	/**
	 * If in batch mode, add trigger to queue; else,
	 * handle the invocation immediately.
	 * 
	 * This is overloaded by either passing a Signal
	 * directly, or by passing the trigger type and
	 * data args and a Signal will be created
	 */
	invoke(trigger, ...args) {
		if(trigger instanceof Message) {
			let msg = trigger;

			/**
			 * Short-circuit the invocation if the trigger has not been loaded
			 */
			if(!this.triggers.has(msg.type)) {
				return false;
			}
	
			if(this.config.isBatchProcessing === true) {
				this.config.queue.add(msg);
	
				return true;
			} else {
				return this.__handleMessage(msg);
			}
		}

		/**
		 * Short-circuit the invocation if the trigger has not been loaded
		 */
		if(!this.triggers.has(trigger)) {
			return false;
		}

		if(this.config.isBatchProcessing === true) {
			this.config.queue.add([ trigger, ...args ]);

			return true;
		} else {
			return this.__handleInvocation(trigger, ...args);
		}
	}

	/**
	 * Process @qty amount of queued triggers
	 */
	process(qty = this.config.maxBatchSize) {
		if(this.config.isBatchProcessing !== true) {
			return [];
		}

		const queue = [ ...this.config.queue ];
		const results = [];
		const runSize = Math.min(qty, this.config.maxBatchSize);

		for(let i = 0; i < runSize; i++) {
			const [ trigger, ...args ] = queue[ i ];
			const result = this.__handleInvocation(trigger, ...args);

			results.push(result);
		}

		this.config.queue = new Set(queue.slice(runSize));

		return results;
	}

	async asyncInvoke(trigger, ...args) {
		return await Promise.resolve(this.invoke(trigger, ...args));
	}
	async asyncProcess(qty = this.config.maxBatchSize) {
		return await Promise.resolve(this.process(qty));
	}

	static Create(obj = {}) {
		return new this(obj);
	}
	static Factory(qty = 1, fnOrObj) {
		// Single-parameter override for .Spawning one (1) this
		if(typeof qty === "function" || typeof qty === "object") {
			fnOrObj = qty;
			qty = 1;
		}

		let hbases = [];
		for(let i = 0; i < qty; i++) {
			let hbase = this.Create(typeof fnOrObj === "function" ? fnOrObj(i, qty) : fnOrObj);

			hbases.push(hbase);
		}

		if(qty === 1) {
			return hbases[ 0 ];
		}

		return hbases;
	}
};

export default Agent;