import Node from "../node/Node";

export const Subscribable = target => ({
	$pre(node, overlay) {
		node._subscriptions = new Set();
	},
	$post(node, overlay) {},
	
	// state: {},
	// nodes: {},
	triggers: [
		"receive",
		"subscribe",
		"unsubscribe",
	],
	// subscriptions: new Set(),
	// meta: {},
	// config: {},
	actions: {
		addSubscriber(subscribers = [], twoWay = false) {
			if(!Array.isArray(subscribers)) {
				subscribers = [ subscribers ];
			}
			
			let newSubscribers = [];
			for(let subscriber of subscribers) {
				if(subscriber !== target && (subscriber instanceof Node || typeof subscriber === "function")) {
					target.subscriptions.add(subscriber);

					if(twoWay && subscriber instanceof Node) {
						subscriber.subscriptions.add(target);
					}

					newSubscribers.push(subscriber);
				}
			}
			
			if(newSubscribers.length) {
				target.actions.invoke("subscribe", newSubscribers);
			}

			return target;
		},
		removeSubscriber(subscribers = [], twoWay = false) {
			if(!Array.isArray(subscribers)) {
				subscribers = [ subscribers ];
			}
			
			let unsubscribers = [];
			for(let subscriber of subscribers) {
				let result = target.subscriptions.delete(subscriber);

				if(twoWay && subscriber instanceof Node) {
					subscriber.subscriptions.delete(target);
				}

				if(result) {
					unsubscribers.push(subscriber);
				}

				unsubscribers.push(subscriber);
			}

			if(unsubscribers.length) {
				target.actions.invoke("unsubscribe", unsubscribers);
			}

			return target;
		},

		subscribeTo(node) {
			if(node instanceof Node) {
				node.actions.addSubscriber(target);
			}

			return target;
		},
		unsubscribeFrom(node) {
			if(node instanceof Node) {
				node.actions.addSubscriber(target);
			}

			return target;
		},

		receive(emitter, ...args) {
			if(target !== emitter) {
				target.actions.invoke("receive", emitter, ...args);
			}

			return target;
		},
		broadcast(...args) {
			for(let subscriber of target.subscriptions) {
				if(subscriber instanceof Node) {
					subscriber.actions.receive(target, ...args);
				} else if(typeof subscriber === "function") {
					subscriber(target, ...args);
				}
			}

			return target;
		},
	},
});

export default Subscribable;