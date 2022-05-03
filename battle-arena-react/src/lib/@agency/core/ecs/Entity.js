import Agent from "../Agent";

export class Entity extends Agent {
	constructor({ state, Agent = {} } = {}) {
		super({ ...Agent, state });

		this.modules = new Map();

		return new Proxy(this, {
			get: (target, prop) => {
				if(!(prop in target)) {
					/**
					 * NOTE: This is singularly used to access the Module.state (i.e. Component) directly,
					 * via a << Entity[ module.name ] >> syntax.  See note in Component.
					 */
					if(target.modules.has(prop)) {
						return target.modules.get(prop).state;
					}

				}

				return Reflect.get(target, prop);
			},
		});
	}

	register(key, value) {
		this.modules.set(key, value);

		return this;
	}
	unregister(key, value) {
		return this.modules.delete(key, value);
	}

	find(...nameIdOrTags) {
		const ret = new Set();
		for(let input of nameIdOrTags) {
			if(this.modules.has(input)) {
				// @input is a name
				ret.add(this.modules.get(input));
			} else {
				for(let module of this.modules.values()) {
					if(module.tags.has(input)) {
						// @input is a tag
						ret.add(module);
					} else if(module.id === input) {
						// @input is an id
						ret.add(module);
					}
				}
			}
		}

		return [ ...ret ];
	}
};

export default Entity;