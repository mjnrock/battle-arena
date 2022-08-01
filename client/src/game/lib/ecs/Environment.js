// import Relay from "@lespantsfancy/relay";
import { Identity } from "../Identity";
import { Registry } from "../Registry";

export class Environment extends Identity {
	constructor ({ id, tags } = {}) {
		super({ id, tags });

		/**
		 * All Systems should be stored wherein each instance is stored by its name
		 * and is representative of a Singleton instance.
		 */
		this.system = new Registry();

		/**
		 * This acts as an environment-level registry of all Entities within it.
		 */
		this.entity = new Registry();

		/**
		 * All of the generators for Systems, Entities, and Components live here.
		 */
		this.factory = {
			system: new Registry(),
			entity: new Registry(),
			component: new Registry(),
		};

		/**
		 * Add a trivial classifier that attaches the environment to the entity/system.
		 */
		this.system.addClassifier(() => (k, v, e) => v._environment = this);
		this.entity.addClassifier(() => (k, v, e) => v._environment = this);
	}

	bundle(event, ...args) {
		return {
			env: this,
			event,
			args,
		};

		// return new Relay.Message({
		// 	type: event,
		// 	data: args,
		// 	env: this,
		// });
	}
	dispatch(event, ...args) {
		const [ module, event ] = event.split(".");
		const system = this.system[ module ];

		if(system && module && event) {
			const msg = this.bundle(event, ...args);

			return system.emit(event, msg, ...args);
		}
	}
};

export default Environment;