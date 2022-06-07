import { validate } from "uuid";
import AgencyBase from "../AgencyBase";
import Agent from "../Agent";

export class Subscription extends AgencyBase {
	constructor(subscribor, subscribee, callback, { mutator, id, tags = [] } = {}) {
		super({ id, tags });

		/**
		 * UUID
		 */
		this.subscribor = validate(subscribor) ? subscribor : subscribor.id;

		/**
		 * UUID
		 */
		this.subscribee = validate(subscribee) ? subscribee : subscribee.id;

		/**
		 * Function | Agent
		 */
		this.callback = callback;

		/**
		 * Function
		 */
		this.mutator = mutator;


		if(typeof this.callback !== "function" && !(this.callback instanceof Agent)) {
			throw new Error("Subscription callback must be a [function|Agent]");
		}
	}

	send(...args) {
		if(typeof this.mutator === "function") {
			args = this.mutator(...args);
		}

		if(this.callback instanceof Agent) {
			this.callback.emit(...args);
		} else {
			return this.callback(...args);
		}
	}
};

export default Subscription;