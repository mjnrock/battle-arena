import { v4 as uuid } from "uuid";

import Struct from "./ecs/Struct";
import Message from "./comm/Message";

export class Agent {
	static Hooks = {		//? Allow for universal values to invoke short-circuits in the proxy traps (e.g. prevent update, change accessor return value, etc.)
		Abort: Struct.Hooks.Abort,			// If set hook returns this, prevent the update
		
		// These are standardized traps to modify Agent to more easily conform to some exogenous paradigm (e.g. extends EventEmitter)
		Traps: {
			/**
			 * This is a standardized hook to allow an Agent to easily absorb Eventables (e.g. WebSocket) using familiar on___ syntax
			 * This is a set-proxy trap to allow handlers to be added thus:	this.ontriggername = fn --> this.addTrigger(triggername, value)
			 * e.g. onCat --> "Cat" trigger | ondogfish --> "dogfish" trigger
			 */
			OnTrigger: (target, prop, value) => {
				if(prop.substr(0, 2) === "on") {
					if(typeof value === "function") {
						target.addTrigger(prop.slice(2), value);
					} else if(Array.isArray(value)) {	// Assume the array is filled with handlers (.addTriggers checks)
						target.addTrigger(prop.slice(2), ...value);
					}

					return Agent.Hooks.Abort;	// This causes the proxy short-circuit; without this, the set trap will inappropriately continue to Reflect.set()
				}
			},
			SetCommandHandler: (target, prop, value) => {
				if(prop[ 0 ] === "$") {
					if(typeof value === "function") {
						target.addTrigger(`$pre`, value);
					}
				}
			},
		},
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
			// transients: new Map(),			//TODO:	If a trigger-handler(s) is added via .once/.fixed (not yet implemented), add the trigger-handler(s) here, too << Map.set(trigger, [ current, max, ...handlers ]) >>.  Increment current each invocation; once current === max, permanently remove the trigger-handler(s).
			isReducer: true,				// Make ALL triggers return a state -- to exclude a trigger from state, create a * handler that returns true on those triggers
			allowRPC: true,					// If no trigger handlers exist AND an internal method is named equal to the trigger, pass ...args to that method
			allowMultipleHandlers: true,	// Allow one (and only one -- overwrites will occur) handler per trigger (NOTE: This is intended to be set on and left alone after instantiation, and as such, this ONLY works on the .addTrigger/s functions (and seed triggers) -- .invoke contains no logic to check for this setting).  This is useful for creating Agent's where their intrinsic nature makes multiple handlers undesirable (e.g. GameLoop).
			generatePayload: false,			// If true, handlers will receive ([ ...args ], payload) or ([ msg ], payload), if false, handlers will receive (...args) -- reducers will receive (...args, { previous, next }).  This allows for greater customization of an Agent's behavior (e.g GameLoop never needs a payload, but a Router always would to know sender)
			broadcastUpdate: true,			// If true, handlers will receive ([ ...args ], payload) or ([ msg ], payload), if false, handlers will receive (...args) -- reducers will receive (...args, { previous, next }).  This allows for greater customization of an Agent's behavior (e.g GameLoop never needs a payload, but a Router always would to know sender)
			broadcastDispatch: false,			// If true, handlers will receive ([ ...args ], payload) or ([ msg ], payload), if false, handlers will receive (...args) -- reducers will receive (...args, { previous, next }).  This allows for greater customization of an Agent's behavior (e.g GameLoop never needs a payload, but a Router always would to know sender)
			
			//* Batching config
			queue: new Set(),				// The repository for triggers when set to process in batches
			isBatchProcessing: false,		// The flag to determine if triggers should be batched or handled immediately
			maxBatchSize: 1000,				// The maximum quantity of triggers a single batch process will handle before terminating

			//* Trigger config
			namespace,						// An optional namespace for collisions and complex relationships
			routeTrigger: "$route",		// The trigger that will be fired when .state is modified
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

	adapt(fnOrObj) {
		if(typeof fnOrObj === "function") {
			fnOrObj = fnOrObj(this);
		}

		if(typeof fnOrObj === "object") {
			for(let [ key, value ] of Object.entries(fnOrObj)) {
				this[ key ] = value;
			}
		}

		return this;
	}


	/**
	 * Convenience function for toggling/altering configuration booleans -- must be a boolean
	 */
	toggle(configAttribute, newValue) {
		//TODO Account for nested keys
		// if(typeof configAttribute === "object") {
		// 	for(let [ key, value ] of Object.entries(configAttribute)) {
		// 		this.toggle(key, value);
		// 	}

		// 	return this;
		// }

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
	 * @trigger can be anything, not limited to strings -- though there are advantages to using strings
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

	get $router() {
		return this.triggers.get(`$router`).values().next().value;
	}
	$route(...args) {
		if(typeof this.$router === "function") {
			return this.invoke(...this.$router(...args));
		} else if(this.$router instanceof Agent) {
			return this.invoke(...this.$router.$route(...args));
		}
	}

	/**
	 * The purpose of this handling abstraction is to more easily deal with batching vs immediate invocations
	 * This should NOT be used externally.  While triggers don't have to be string, there are several functionality and feature enhancements when they are.
	 * 
	 * Filters/Effects ($pre/$post) can be added specifically for a @trigger, by prepending *|** respectively (e.g *trigger, **trigger)
	 * When used in conjunction with $pre/$post, filters/effects can be trigger-specific, or generalized to all triggers
	 */
	__handleInvocation(trigger, ...args) {
		/**
		 * Special-case use of command $router.  By passing "$route" as a trigger,
		 * the Agent will generate new arguments for .invoke, received as the result
		 * of executing the primary $router handler.
		 */
		if(trigger === this.config.routeTrigger) {
			if(typeof this.$router === "function") {
				return this.invoke(...this.$router(...args));
			}
		}

		// Prevent the handling of triggers containg specialty flag-prefixes
		if(typeof trigger === "string" && (trigger[ 0 ] === "$" || trigger[ 0 ] === "*")) {
			return false;
		}
		
		// Many contingent handlers receive the same payload, so abstract it here
		let payload = this.assert("generatePayload", true) ? this.__generatePayload({ id: uuid(), trigger, args }) : args;


		/**
		 * ? Params hooks
		 * @payload must remain destructuable
		 */
		const params = [
			// ...(this.triggers.get(`$params:${ trigger.toString() }`) || []),		// TBD on flag
			...(this.triggers.get("$params") || []),
		];
		if(params.length) {
			for(let param of params) {
				payload = param(payload);
			}
			
			if(!Array.isArray(payload)) {
				payload = [ payload ];
			}
		}

		/**
		 * ? Notifications/RPC check
		 */
		const handlers = this.triggers.get(trigger);
		if(trigger === this.config.notifyTrigger || trigger === this.config.dispatchTrigger) {
			for(let handler of handlers) {
				handler(...payload);
			}
			
			return true;
		} else if(!handlers) {
			
		
			// Verify that the RPC has a landing method
			if(this.config.allowRPC === true && typeof trigger === "string" && typeof this[ trigger ] === "function") {
				this[ trigger ](...args);
				
				return true;
			}
			
			return false;
		}


		/**
		 * ? Filter/Pre hooks
		 * These act as filters iff one returns << true >> and will cease execution immediately (i.e. no handlers or effects will be processed)
		 */
		const filters = [
			...(this.triggers.get(`*${ trigger.toString() }`) || []),
			...(this.triggers.get("$pre") || []),
		];
		for(let filter of filters) {
			let result = filter(trigger, ...payload);

			if(result === true) {
				return false;
			}
		}
		

		/**
		 * ? Reducer/Dispatcher test
		 */
		let invocationType;
		if(this.config.isReducer === true) {			
			let next = this.state;
			for(let handler of handlers) {
				const previous = next;
				
				if(this.assert("generatePayload", true)) {
					next = handler(payload[ 0 ], {
						previous,
						next,
						...payload[ 1 ],
					});
				} else {
					next = handler(...payload, {
						previous,
						next,
					});
				}
				
				if(next === void 0) {
					next = previous;
				}
			}
			
			
			const oldState = this.state;
			this.state = next;
			
			// Broadcast that a reducer-update has happened, if enabled
			if(this.config.broadcastUpdate === true && oldState !== this.state) {
				invocationType = this.config.notifyTrigger;

				this.invoke(invocationType, trigger, { current: next, previous: oldState }, ...args);
			}
		} else {			
			for(let handler of handlers) {
				handler(...payload);
			}
			
			// Broadcast that a dispatch has happened, if enabled
			if(this.config.broadcastDispatch === true) {
				invocationType = this.config.dispatchTrigger;

				this.invoke(invocationType, trigger, this.state, ...args);
			}
		}


		/**
		 * ? Effect/Post hooks
		 * Treat these like Effects
		 */
		const effects = [
			...(this.triggers.get(`**${ trigger.toString() }`) || []),
			...(this.triggers.get("$post") || []),
		];
		for(let effect of effects) {
			effect(trigger, ...payload);
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
		if(this.config.allowRPC !== true && !this.triggers.has(trigger)) {
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

	/**
	 * Delete all key-values that are deletable and invoke the deconstructor
	 */
	terminate() {
		for(let key of Object.keys(this).filter(key => key !== "id")) {
			delete this[ key ];
		}

		this.deconstructor(this);

		return true;
	}

	async asyncInvoke(trigger, ...args) {
		return await Promise.resolve(this.invoke(trigger, ...args));
	}
	async asyncProcess(qty = this.config.maxBatchSize) {
		return await Promise.resolve(this.process(qty));
	}

	toObject(includeId = true) {
		const obj = {
			...this,
		};
		
		if(includeId === false) {
			delete obj.id;
		}

		return obj;
	}
	toJson() {
		return JSON.stringify(this.toObject());
	}

	static Create(...args) {
		return new this(...args);
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
};

export default Agent;