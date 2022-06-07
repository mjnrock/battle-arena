import Registry from "../Registry";
import Message from "./Message";

export class MessageCollection extends Registry {
	constructor(messages = [], agencyBaseObj = {}) {
		super(messages, agencyBaseObj);

		this.encoder = Registry.Encoders.InstanceOf(this, Message);
	}

	addMessage(message) {
		return this.register(message);
	}
	removeMessage(message) {
		return this.unregister(message);
	}
};

export default MessageCollection;