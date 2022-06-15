import { v4 as uuid, validate } from "uuid";
import AgencyBase from "../AgencyBase";
import Agent from "../Agent";

export class Subscription extends AgencyBase {
	constructor(subscribor, subscribee, callback, { mutator, id, tags = [] } = {}) {
		super({ id, tags });

		/**
		 * *type:	UUID
		 */
		this.subscribor = validate(subscribor) ? subscribor : subscribor.id;

		/**
		 * *type:	UUID
		 */
		this.subscribee = validate(subscribee) ? subscribee : subscribee.id;

		/**
		 * *type:	Function | Agent
		 */
		this.callback = callback;

		/**
		 * *type:	Function
		 * This mutator function allows for the dynamic modification of the arguments passed to .send
		 * If this is not set, the arguments passed to .send will be passed directly to the callback.
		 */
		this.mutator = mutator;


		if(!(validate(this.subscribor) && validate(this.subscribee))) {
			throw new Error("Subscription @subscribor and @subscribee must resolve to a valid [UUID]");
		}
		if(typeof this.callback !== "function" && !(this.callback instanceof Agent)) {
			throw new Error("Subscription @callback must be a [function|Agent]");
		}
	}

	send(...args) {
		let newArgs = args;
		if(typeof this.mutator === "function") {
			/**
			 * This object contains the arguments that were passed to the callback,
			 * as well as some relevant metadata pertaining to the subscription.
			 */
			const mutatorObj = {
				subscribor: this.subscribor,
				subscribee: this.subscribee,
				tags: Array.from(this.tags),
				args: newArgs,
			};

			/**
			 * Recast the arguments as the return value of the mutator function.
			 */
			newArgs = this.mutator(mutatorObj);
		}

		if(this.callback instanceof Agent) {
			this.callback.emit(...newArgs);
		} else {
			return this.callback(...newArgs);
		}
	}

	static CreateAnonymous(callback, { mutator, id, tags = [] } = {}) {
		return new Subscription(uuid(), uuid(), callback, { mutator, id, tags });
	}
};

export default Subscription;