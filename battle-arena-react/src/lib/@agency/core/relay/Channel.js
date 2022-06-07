import { validate } from "uuid";

import AgencyBase from "../AgencyBase";
import Agent from "../Agent";
import Registry from "../Registry";
import Message from "./Message";
import MessageCollection from "./MessageCollection";
import Subscription from "./Subscription";
import { singleOrArrayArgs } from "../../util/helper";

export class Channel extends AgencyBase {
	static MessageTrigger = `@channel`;

	constructor ({ config = {}, id, tags } = {}) {
		super({ id, tags });

		this.messages = new MessageCollection();		//FIXME This allows sending the same message multiple times
		this.subscriptions = new Registry();

		this.config = {
			retainHistory: false,
			maxHistory: 100,
			atMaxReplace: true,

			...config,
		};
	}

	addSubscriber(subscriber, callback, alias) {
		let subscribor,
			subscribee = this.id;

		if(validate(subscriber)) {
			subscribor = subscriber;
		} else if(typeof subscriber === "object" && subscriber.id) {
			subscribor = subscriber.id;
		}

		if(subscriber instanceof Agent && !callback) {
			callback = subscriber;
		}

		const subscription = new Subscription(subscribor, subscribee, callback);

		return this.subscriptions.registerWithAlias(subscription, subscribor, alias);
	}
	removeSubscriber(subscriber) {
		for(let subscription of this.subscriptions.iterator) {
			if(subscription.subscribor === subscriber) {
				this.subscriptions.unregister(subscription);
				
				return true;
			} else if(typeof subscriber === "object" && subscriber.id && subscription.subscribor === subscriber.id) {
				this.subscriptions.unregister(subscription);

				return true;
			}
		}

		return false;
	}

	setMessages(messages) {
		this.messages = new MessageCollection(messages);

		return this;
	}
	addMessage(message) {
		if(this.config.retainHistory) {
			if(this.messages.sizeValues < this.config.maxHistory) {
				this.messages.addMessage(message);

				return true;
			} else {
				if(this.config.atMaxReplace) {
					const array = [
						...this.messages.iterator,
						message,
					];

					this.setMessages(array.slice(1));

					return true;
				}
			}
		}

		return false;
	}
	addMessages(...messages) {
		messages = singleOrArrayArgs(messages);

		for(let message of messages) {
			this.addMessage(message);
		}

		return this;
	}
	clearMessages() {
		this.messages = new MessageCollection();

		return this;
	}

	/**
	 * This will invoke the callback for each subscription directly,
	 * sending the ...args verbatim.  As such, it is not recommended to
	 * use this method for sending messages, but rather use the send()
	 * method, which uses this method to internally, but with Agency
	 * opinionated message handling.
	 */
	broadcast(...args) {
		for(let subscription of this.subscriptions.iterator) {
			subscription.send(...args);
		}

		return this;
	}
	sendTo(subscriber, ...args) {
		if(validate(subscriber)) {
			const subscription = this.subscriptions.get(subscriber);

			if(subscription) {
				subscription.send(...args);

				return true;
			}
		} else if(typeof subscriber === "object" && subscriber.id) {
			return this.sendTo(subscriber.id, ...args);
		}

		return false;
	}
	
	sendMessage(message) {
		if(message instanceof Message) {
			/**
			 * Undergoes validation and checking against the configuration
			 */
			this.addMessage(message);

			/**
			 * Actually invoke the subscription callbacks, with optional mutators
			 */
			this.broadcast(Channel.MessageTrigger, message);
		}

		return this;
	}
	sendData(data, tags = []) {
		tags = singleOrArrayArgs(tags);

		const message = new Message({
			data,
			tags,
			emitter: this,
		});

		return this.sendMessage(message);
	}
	send(...args) {
		const [ first, ...rest ] = args;

		if(first instanceof Message) {
			return this.sendMessage(first);
		}

		return this.sendData(...args);
	}

};

export default Channel;