import Registry from "../Registry";
import Message from "./Message";

//TODO: Formalize the ability to replay messages from a given index / time
export class MessageCollection extends Registry {
	constructor(messages = [], agencyBaseObj = {}) {
		super(messages, agencyBaseObj);

		this.encoder = Registry.Encoders.InstanceOf(Message);
	}

	addMessage(message) {
		return this.register(message);
	}
	removeMessage(message) {
		return this.unregister(message);
	}
};

export default MessageCollection;