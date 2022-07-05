import Channel from "./Channel";
import Message from "./Message";
import MessageCollection from "./MessageCollection";

/**
 * The Service is a handler registry that allows for the handling of messages
 * when they are sent to the bus and have a corresponding handler registered via
 * the Message.type property.
 * 
 * A generic handler can be registered under the "default" key, which will be called
 * for all messages that will *only be called if no handler exists* for that Message.type.
 */
export class Service {
	constructor (handlers = []) {
		this.handlers = new Map();

		this.addHandlers(handlers);
	}

	addHandler(name, handler) {
		this.handlers.set(name, handler);

		return this;
	}
	addHandlers(handlers) {
		let entries = [];

		if(handlers instanceof Map) {
			entries = Array.from(handlers.entries());
		} else if(Array.isArray(handlers)) {
			entries = handlers;
		} else if(typeof handlers === "object") {
			entries = Object.entries(handlers);
		}

		if(entries.length) {
			entries.forEach((entry) => {
				this.handlers.set(entry[ 0 ], entry[ 1 ]);
			});
		}

		return this;
	}
	removeHandler(name) {
		return this.handlers.delete(name);
	}
	removeHandlers(names) {
		names.forEach((name) => {
			this.handlers.delete(name);
		});

		return this;
	}

	getHandler(name) {
		return this.handlers.get(name);
	}

	receive(message) {
		if(message instanceof Channel) {
			this.receive(message.messages);

			return this;
		} else if(message instanceof MessageCollection) {
			message.each((msg) => {
				this.receive(msg);
			});

			return this;
		}

		/**
		 * A universal pre-handler that can be used to short-circuit evaluation
		 * if the handler returns true.
		 */
		const pre = this.handlers.get("*");

		/**
		 * The handler for a given Message.type.
		 */
		const handler = this.handlers.get(message.type || "default");

		/**
		 * A universal post-handler that can be used to perform any post-processing
		 * on the message, such as effects.
		 */
		const post = this.handlers.get("**");

		/**
		 * A boolean flag to determine if the message was handled.
		 */
		let handled = false;

		if(pre) {
			const filter = pre(message);

			/**
			 * Short-circuit the evaluation if the pre-handler returns true.
			 */
			if(filter === true) {
				return false;
			}
		}

		if(handler) {
			handler(message);

			handled = true;
		}

		if(post) {
			post(message);
		}

		return handled;
	}
}

export default Service;