import { validate } from "uuid";
import AgencyBase from "../AgencyBase";

export class Message extends AgencyBase {
	constructor({ id, tags = [], data = {}, meta = {}, emitter, type } = {}) {
		super({ id, tags });

		if(data == null || (typeof data === "object" && Object.keys(data).length === 0)) {
			throw new Error("Message data must be populated");
		}
		
		this.data = data;
		this.meta = {
			timestamp: Date.now(),

			...meta,
		};

		if(validate(emitter)) {
			this.meta.emitter = emitter;
		} else if(typeof emitter === "object" && emitter.id) {
			this.meta.emitter = emitter.id;
		}

		if(type) {
			this.tags = new Set([ type, ...this.tags ]);
		}
	}

	get type() {
		return this.tags.values().next().value;
	}
};

export default Message;