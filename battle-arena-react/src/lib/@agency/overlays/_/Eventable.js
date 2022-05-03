export const Eventable = target => ({
	/**
	 * This will execute directly *after* Eventable(node) has been evaluated
	 * 	but before any other entries have been be evaluated
	 */
	$pre(node, overlay) {
		node._triggers = new Map();
	},
	/**
	 * This will after *all* other overlay entries have been processed
	 */
	$post(node, overlay) {},
	
	// state: {},
	// nodes: {},
	triggers: [
		"*",		// Pre-trigger hook -- all handlers will execute before trigger handlers
		"**",		// Post-trigger hook -- all handlers will execute after trigger handlers
		"@",		// Filter hook -- Any return value *except* TRUE will immediately return (i.e. qty > 1 --> conjunctive)
		"update",	// Invoke state change -- Add reducers here to sequentially update state if setup as reducer (config.isReducer must be true)
		"merge",	// Invoke state change -- Add reducers here to sequentially update state if setup as merge reducer (config.isReducer must be true)
		"state",	// Informed of state change -- Add handlers to perform work *after* state has updated -- invoking an "update" trigger will also invoke a "state" trigger, afterward
	],
	// subscriptions: [],
	// meta: {},
	config: {
		isReducer: false,
	},
	actions: {
		toggleReducer(bool) {
			if(typeof bool === "boolean") {
				target.meta.config.isReducer = bool;
			} else {
				target.meta.config.isReducer = !target.meta.config.isReducer;
			}

			return target.meta.config.isReducer;
		},

		invoke(trigger, ...args) {
			if(!(target.triggers.get(trigger) instanceof Set)) {
				target.triggers.delete(trigger);

				return target;
			}
			
			for(let filter of target.triggers.get("@")) {
				const result = filter({ target, trigger: "@" })(...args);

				if(result !== true) {
					return target;
				}
			}

			for(let handler of target.triggers.get("*")) {
				handler({ target, trigger: "*" })(...args);
			}
			
			if(target.meta.config.isReducer && (trigger === "update" || trigger === "merge")) {
				let [ state ] = args;
				for(let handler of target.triggers.get(trigger)) {
					state = handler({ target, trigger })(...args);
				}
				
				const oldState = target.state;
				if(trigger === "update") {
					target.state = state;
				} else if(trigger === "merge") {
					if(Array.isArray(target.state)) {
						target.state = [
							...oldState,
							...state,
						];
					} else {
						target.state = {
							...oldState,
							...state,
						};
					}
				}
					
				if(state !== oldState) {
					target.actions.invoke("state", state, oldState);
				}
			} else {
				for(let handler of target.triggers.get(trigger)) {
					handler({ target, trigger, update: (...args) => target.actions.invoke("update", ...args), asyncUpdate: (...args) => target.actions.asyncInvoke("update", ...args) })(...args);
				}
			}

			for(let handler of target.triggers.get("**")) {
				handler({ target, trigger: "**" })(...args);
			}

			return target;
		},
		async asyncInvoke(trigger, ...args) {
			return await target.actions.invoke(trigger, ...args);
		},

		addHandler(trigger, ...fns) {
			if(!(target.triggers.get(trigger) instanceof Set)) {
				target.triggers.set(trigger, new Set());
			}

			for(let fn of fns) {
				if(typeof fn === "function") {
					target.triggers.get(trigger).add(fn);
				}
			}

			return target;
		},
		addHandlers(addHandlerArgs = []) {
			for(let [ trigger, ...fns ] of addHandlerArgs) {
				target.addHandler(trigger, ...fns);
			}

			return target;
		},
		removeHandler(trigger, ...fns) {
			if(!(target.triggers.get(trigger) instanceof Set)) {
				return target;
			}

			for(let fn of fns) {
				target.triggers.get(trigger).delete(fn);
			}

			return target;
		},
		removeHandlers(removeHandlerArgs = []) {
			for(let [ trigger, ...fns ] of removeHandlerArgs) {
				target.removeHandler(trigger, ...fns);
			}

			return target;
		},
	},
});

export default Eventable;