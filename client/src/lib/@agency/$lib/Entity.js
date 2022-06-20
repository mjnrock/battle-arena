import Component from "./Component";
import Registry from "./Registry";

export class Entity extends Registry {
	constructor (components = {}, { state = {}, ...opts } = {}) {
		super({}, {
			/**
			 * By default, only allow components to be added to the entity.
			 */
			encoder: Registry.Encoders.InstanceOf(Component),

			/**
			 * By default, classify components by any tags that they have.
			 */
			classifiers: [
				Registry.Classifiers.Tagging(),
			],

			...opts,
		});

		/**
		 * Register all provided components.
		 */
		this.register(components);

		/**
		 * Optionally include a *shareable* state on the Entity.
		 */
		this._state = state;
	}

	/**
	 * Broadcast a message payload to all components registered to the Entity.
	 */
	send(emitter, { namespace, event, data, filter, ...rest } = {}) {
		/**
		 * Enforce that the emitter is a Component.
		 */
		if(!(emitter instanceof Component)) {
			throw new Error("@emitter must be an instance of Component");
		}

		for(let component of this.values()) {
			/**
			 * Optionally ignore any components that do not match the filter.
			 */
			if(typeof filter === "function" && filter(component) !== true) {
				continue;
			}

			/**
			 * Prevent sending message to self.
			 */
			if(emitter.id !== component.id) {
				component.receive({
					namespace,
					event,
					data,
					state: this._state,

					...rest,
				});
			}
		}
	}
}

export default Entity;