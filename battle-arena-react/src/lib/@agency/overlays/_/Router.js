import Node from "../node/Node";

/**
 * Any <Node> that acts as a @handler will receive a
 * 	"route" trigger invocation whenever << Router.route >>
 * 	is called.  As such, the handler-Node should have a
 * 	"route" handler within its event base.
 */

export const fnDefaultRoute = () => true;

export const Router = target => ({
	state: {
		//TODO Only the variables exist, not the functionality to utilize a queue
		queue: new Set(),
	},
	// nodes: {},
	triggers: {
		receive: [
			({ target: node, trigger }) => (emitter, ...args) => node.actions.route(...args),
		],
	},
	// subscriptions: [],
	// meta: {},
	config: {
		routes: [],
		isMultiMatch: false,
		isBatchProcessing: false,
		maxQueueSize: Infinity,
	},
	actions: {
		toggleMultiMatch(bool) {
			if(typeof bool === "boolean") {
				target.meta.config.isMultiMatch = bool;
			} else {
				target.meta.config.isMultiMatch = !target.meta.config.isMultiMatch;
			}

			return target.meta.config.isMultiMatch;
		},

		addRoute(filter, handler) {
			target.meta.config.routes.push([ filter, handler ]);

			return target;
		},
		addRoutes(addRouteArgs = []) {
			for(let [ filter, handler ] of addRouteArgs) {
				target.addRoute(filter, handler);
			}

			return target;
		},
		removeRoute(filter, handler) {
			target.meta.config.routes = target.meta.config.routes.filter(([ f, h ]) => !(f === filter && h === handler));
			
			return target;
		},
		removeRoutes(removeRouteArgs = []) {
			for(let [ filter, handler ] of removeRouteArgs) {
				target.removeRoute(filter, handler);
			}

			return target;
		},

		/**
		 * This will create a defaulting routing to the @node
		 */
		addReceiver(node) {
			return target.actions.addRoute(fnDefaultRoute, node);
		},
		removeReceiver(node) {
			return target.actions.removeRoute(fnDefaultRoute, node);
		},

		route(...args) {
			for(let [ filter, handler ] of target.meta.config.routes) {
				let hasResult = false;

				let receiver = handler;				
				if(typeof filter === "function") {
					let result = filter(...args);

					if(result === true) {
						if(handler instanceof Node) {
							handler.actions.invoke("route", target, ...args);
						} else {
							receiver(target, ...args);
						}

						hasResult = true;
					}
				}
				
				//TODO Introduce @type/.type specificity for regexp/string matching
				/*if(typeof filter === "string") {
					if(true) {
						receiver(node, ...args);
						hasResult = true;
					}
				} else if(filter instanceof RegExp) {
					if(true) {
						receiver(node, ...args);
						hasResult = true;
					}
				}*/

				if(hasResult === true && target.meta.config.isMultiMatch === false) {
					return target;
				}
			}

			return target;
		},
	},
});

export const TriggerTest = {
	Loose(input) {
		return trigger => trigger == input;
	},
	Equals(type) {
		return trigger => trigger === type;
	},
	Includes(types = []) {
		return trigger => types.includes(trigger);
	},
	Match(regex) {
		return trigger => regex.test(trigger.toString());
	},
};

export default Router;