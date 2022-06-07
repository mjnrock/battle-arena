import { validate } from "uuid";
import AgencyBase from "../AgencyBase";
import Registry from "../Registry";
import Message from "./Message";
import MessageCollection from "./MessageCollection";
import Subscription from "./Subscription";

export class Channel extends AgencyBase {
	constructor({ id, tags } = {}) {
		super({ id, tags });

		this.messages = new MessageCollection();
		this.subscriptions = new Registry();
	}

	addSubscriber(subscriber, callback) {
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

		return this.subscriptions.register(subscription);
	}
	removeSubscriber(subscriber) {
		for(let subscription of this.subscriptions.values()) {
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

	/**
	 * This will invoke the callback for each subscription directly,
	 * sending the ...args verbatim.  As such, it is not recommended to
	 * use this method for sending messages, but rather use the send()
	 * method, which uses this method to internally, but with Agency
	 * opinionated message handling.
	 */
	broadcast(...args) {
		for(let subscription of this.subscriptions.values()) {
			subscription.send(...args);
		}

		return this;
	}
	sendMessage(message) {
		if(message instanceof Message) {
			this.messages.addMessage(message);
			this.broadcast(message.type, message.data, message);
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