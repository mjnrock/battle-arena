import { v4 as uuid } from "uuid";

import Struct from "./ecs/Struct";
import Message from "./comm/Message";

export class Agent {
	static Hooks = {		//? Allow for universal values to invoke short-circuits in the proxy traps (e.g. prevent update, change accessor return value, etc.)
		ABORT: Struct.Hooks.Abort,			// If set hook returns this, prevent the update
		GET: `get`,
		PRE: `pre`,
		POST: `post`,
		DELETE: `delete`,
		DESTROY: `destroy`,

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

					return Agent.Hooks.ABORT;	// This causes the proxy short-circuit; without this, the set trap will inappropriately continue to Reflect.set()
				}
			},
			SetCommandHandler: (target, prop, value) => {
				if(prop[ 0 ] === "$") {
					if(typeof value === "function") {
						target.addTrigger(`@pre`, value);
					}
				}
			},
			SetStateHandler: (target, prop, value) => {
				if(prop[ 0 ] === "$") {
					return target.state[ prop.slice(1) ];
				}
			},
		},
	};

	constructor ({ state = {}, triggers = [], config, namespace, id, globals = {}, hooks = {} } = {}) {
		this.id = id || uuid();
		this.state = state;
		this.triggers = new Map();
		this.config = {
			//* Agent config
			hooks: {					//? These are proxy hooks that affect how the Agent behaves, in general (e.g. Accessor hook to return value from an API)
				[ Agent.Hooks.GET ]: new Set(),			// Accessor hook
				[ Agent.Hooks.PRE ]: new Set(),			// Pre-set hook
				[ Agent.Hooks.POST ]: new Set(),		// Post-set hook
				[ Agent.Hooks.DELETE ]: new Set(),		// Post-delete hook
				[ Agent.Hooks.DESTROY ]: new Set(),		// this.descontructor hook
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
			triggers: {
				filter: "@filter",			// The trigger to potentially short-circuit an invocation
				effect: "@effect",			// The trigger to fire after all invocation internals are complete
				params: "@params",			// The trigger used to reassign .invoke parameter(s)
				route: "@route",			// The trigger that will invoke << .$router >>
				router: "@router",			// The trigger that will be used to receive a .route invocation
				notify: "@update",			// The trigger that will be fired when .state is modified
				dispatch: "@dispatch",		// The trigger that will be fired when a trigger has been handled (and the Agent is NOT a reducer)
			},

			//* Global context object
			globals: {						//? These will be added to all @payloads, if enabled
				...globals,
			},

			...config,						// Seed object
		};

		this.hook(hooks);
		this.addTriggers(triggers);

		return new Proxy(this, {
			get: (target, prop) => {
				let value = Reflect.get(target, prop);
				for(let fn of target.config.hooks.get) {
					let newValue = fn(target, prop, value);

					// Short-circuit execution and return substitute value
					if(newValue !== void 0) {
						return newValue;
					}
				}

				return value;
			},
			set: (target, prop, value) => {
				let newValue = value;
				for(let fn of target.config.hooks.pre) {
					newValue = fn(target, prop, value);

					if(newValue === Agent.Hooks.ABORT) {
						return Agent.Hooks.ABORT;
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

					if(shouldDelete === Agent.Hooks.ABORT) {
						return Agent.Hooks.ABORT;
					}
				}

				if(!!shouldDelete) {
					return Reflect.deleteProperty(target, prop);
				}

				return false;
			},
		});
	}

	deconstructor() {
		for(let fn of this.config.hooks.destroy) {
			fn(this);
		}

		for(let key of Reflect.keys(this)) {
			if(key !== "deconstructor") {
				delete this[ key ];
			}
		}

		return this;
	}

	hook(hook, ...fns) {
		if(typeof hook === "object") {
			for(let [ key, value ] of Object.entries(hook)) {
				this.hook(key, value);
			}

			return this;
		}

		if(Array.isArray(fns[ 0 ])) {
			[ fns ] = fns;
		}

		for(let fn of fns) {
			this.config.hooks[ hook ].add(fn);
		}

		return this;
	}
	dehook(hook, ...fns) {
		if(Array.isArray(fns[ 0 ])) {
			[ fns ] = fns;
		}

		for(let fn of fns) {
			this.config.hooks[ hook ].delete(fn);
		}

		return this;
	}

	/**
	 * An agent can be passed as argument to have this copy all kvps,
	 * with an optional list of keys to ignore ("id" present by default)
	 */
	adapt(fnOrObj, { filter = [ "id" ], filterType = "exclude" } = {}) {
		if(typeof fnOrObj === "function") {
			fnOrObj = fnOrObj(this);
		}

		if(typeof fnOrObj === "object") {
			for(let [ key, value ] of Object.entries(fnOrObj)) {
				if(filterType === "exclude") {
					if(filter.includes(key)) {
						continue;
					} else {
						if(key === "triggers") {
							this.addTriggers(value);
						} else {
							this[ key ] = value;
						}
					}
				} else if(filterType === "include") {
					if(key === "triggers") {
						this.addTriggers(value);
					} else if(filter.includes(key)) {
						this[ key ] = value;
					} else {
						continue;
					}
				}
			}
		}

		return this;
	}

	/**
	 * This is largely a convenience method for .getState, but may expand its functionality in the future.
	 */
	$(...input) {
		const [ first, second, ...rest ] = input;

		if(typeof first === "string") {						//* Dot-notation key	(e.g. $(`1root.n1.n2`))
			return this.getState(first);
		} else if(Array.isArray(first) && first.raw) {		//* Tagged template	(e.g. $`root.n1.n2`), used in a diminshed capacity (first string only)
			return this.getState(first[ 0 ]);				//	Only grab the first template string (ignore rest for now)
		}

		return this.getState();
	}
	/**
	 * This will run through the dot-notation @nested, and pull out the .state
	 * from the returned value.
	 */
	getState(nested = "") {
		if(Array.isArray(nested) && nested.raw) {	// Back-tick function
			nested = nested[ 0 ].split(".");
		} else if(!Array.isArray(nested)) {
			nested = nested.split(".");
		}

		const [ first, ...rest ] = nested;
		if(nested.length === 1) {
			const potAgent = this.state[ first ];

			if(potAgent instanceof Agent) {
				return potAgent.getState();
			}
		} else if(nested.length > 1) {
			const potAgent = this.state[ first ];

			if(potAgent instanceof Agent) {
				return potAgent.getState(rest);
			}
		}

		return this.state;
	}
	setState(state = {}) {
		const oldState = this.getState();
		this.state = state;

		this.invoke(this.config.triggers.notify, true, { current: this.getState(), previous: oldState });

		return this;
	}
	mergeState(state = {}, isDelete = false) {
		const oldState = this.getState();

		if(isDelete === true) {
			for(let key of Object.keys(state)) {
				delete this.state[ key ];
			}
		} else {
			this.state = {
				...this.state,
				...state,
			};
		}

		this.invoke(this.config.triggers.notify, true, { current: this.getState(), previous: oldState });

		return this;
	}


	/**
	 * Convenience function for toggling/altering configuration booleans -- must be a boolean
	 */
	toggle(configAttribute, newValue) {
		if(typeof configAttribute === "object") {
			for(let [ key, value ] of Object.entries(configAttribute)) {
				this.toggle(key, value);
			}

			return this;
		}

		if(typeof this.config[ configAttribute ] === "boolean") {
			if(typeof newValue === "boolean") {
				this.config[ configAttribute ] = newValue;
			} else {
				this.config[ configAttribute ] = !this.config[ configAttribute ];
			}
		}

		return this;
	}
	assert(configAttribute, expectedValue = true) {
		if(typeof expectedValue === "function") {
			return this.config[ configAttribute ] = expectedValue(this);
		}

		return this.config[ configAttribute ] === expectedValue;
	}
	/**
	 * This function allows for an anonymous function or the internal method name of a function
	 * to invoke @iter times, passing ...@args each iteration, results [ ...results ]
	 */
	repeat(fnName, iters = 1, ...args) {
		const fn = typeof fnName === "function" ? fnName : this[ fnName ];
		const results = [];

		if(typeof fn === "function") {
			for(let i = 0; i < iters; i++) {
				results.push(fn.call(this, ...args));
			}
		}

		return results;
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
				} else if(fn instanceof Agent) {
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
		const router = this.triggers.get(this.config.triggers.router);

		if(!router) {
			return (...args) => args;
		}

		return router.values().next().value;
	}
	$route(...args) {
		let newArgs = false;
		if(typeof this.$router === "function") {
			newArgs = this.$router(...args);
		} else if(this.$router instanceof Agent) {
			newArgs = this.$router.$route(...args);
		}

		if(!!newArgs) {
			return this.invoke(...newArgs);
		}

		return false;
	}


	__invokeHandlers(trigger, ...args) {
		let results = [];
		if(Array.isArray(trigger)) {
			for(let t of trigger) {
				results = [
					...results,
					...this.__invokeHandlers(t, ...args),
				];
			}

			return results;
		}

		const triggers = this.triggers.get(trigger);
		if(!triggers) {
			return [];
		}

		for(let fnOrAgent of triggers) {
			let result;
			if(fnOrAgent instanceof Agent) {
				result = fnOrAgent.$route(trigger, ...args);
			} else {
				result = fnOrAgent(trigger, ...args);
			}

			results.push(result);
		}

		return results;
	}
	/**
	 * The purpose of this handling abstraction is to more easily deal with batching vs immediate invocations
	 * This should NOT be used externally.  While triggers don't have to be string, there are several functionality and feature enhancements when they are.
	 * 
	 * Filters/Effects (@pre/@post) can be added specifically for a @trigger, by prepending *|** respectively (e.g *trigger, **trigger)
	 * When used in conjunction with @/@post, filters/effects can be trigger-specific, or generalized to all triggers
	 */
	__handleInvocation(trigger, ...args) {
		/**
		 * Special-case use of command $router.  By passing "$route" as a trigger,
		 * the Agent will generate new arguments for .invoke, received as the result
		 * of executing the primary $router handler.
		 */
		if(trigger === this.config.triggers.route) {
			if(typeof this.$router === "function") {
				return this.invoke(...this.$router(...args));
			}
		}

		// Prevent the handling of triggers containg specialty flag-prefixes
		if(typeof trigger === "string" && (trigger[ 0 ] === "@" || trigger[ 0 ] === "*")) {
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
			...(this.triggers.get(this.config.triggers.params) || []),
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
		const handlers = this.triggers.get(trigger) || [];
		if(trigger === this.config.triggers.notify || trigger === this.config.triggers.dispatch) {
			for(let handler of handlers) {
				handler(...payload);
			}

			return true;
		} else if(handlers.length === 0) {
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
			...(this.triggers.get(this.config.triggers.filter) || []),
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
		let invocationType,
			stateObj = {};
		if(this.assert("isReducer")) {
			let next = this.state;
			for(let handler of handlers) {
				const previous = next;

				if(this.assert("generatePayload")) {
					next = handler({
						previous,
						current: next,
						...payload[ 1 ],
					}, payload[ 0 ]);
				} else {
					next = handler({
						previous,
						current: next,
					}, ...payload);
				}

				if(next === void 0) {
					next = previous;
				}
			}


			const oldState = this.state;
			this.state = next;

			// Broadcast that a reducer-update has happened, if enabled
			if(this.assert("broadcastUpdate") && oldState !== this.state) {
				invocationType = this.config.triggers.notify;
				stateObj = { current: next, previous: oldState };
			}
		} else {
			// Broadcast that a dispatch has happened, if enabled
			if(this.assert("broadcastDispatch")) {
				invocationType = this.config.triggers.dispatch;
				stateObj = { current: this.state, previous: this.state };
			}

			for(let handler of handlers) {
				handler(stateObj, ...payload);
			}
		}

		if(!!invocationType) {
			this.invoke(invocationType, trigger, stateObj, ...args);
		}


		/**
		 * ? Effect/Post hooks
		 */
		this.__invokeHandlers([ this.config.triggers.effect, `**${ trigger.toString() }` ], trigger, ...payload);

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
	get fire() {
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