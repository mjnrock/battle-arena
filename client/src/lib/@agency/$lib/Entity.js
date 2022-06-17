import Component from "./Component";
import Registry from "./Registry";

export class Entity extends Registry {
	constructor (components = {}, { state = {}, ...opts } = {}) {
		super({}, {
			encoder: Registry.Encoders.InstanceOf(Component),
			classifiers: [
				Registry.Classifiers.InstanceOf(Component),
			],

			...opts,
		});

		this.register(components);

		/**
		 * Optionally include a *shareable* state on the Entity
		 */
		this._state = state;
	}

	send(emitter, { namespace, event, data } = {}) {
		/**
		 * Enforce that the emitter is a Component.
		 */
		if(!(emitter instanceof Component)) {
			throw new Error("@emitter must be an instance of Component");
		}

		for(let component of this.values()) {
			/**
			 * Prevent sending message to self.
			 */
			if(emitter.id !== component.id) {
				component.receive({
					namespace,
					event,
					data,
					state: this._state
				});
			}
		}

		return this;
	}
}

export default Entity;