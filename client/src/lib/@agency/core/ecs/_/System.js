import Context from "../Context";

export class System extends Context {
	static Registry = new Map();
	
	/**
	 * $ conforms to $ingleton-Selector syntax.
	 */
	static $(nomen, ...entities) {
		const instance = System.Registry.get(nomen);
		
		return (trigger, ...args) => {
			const [ first ] = entities;

			if(typeof first === "function") {
				entities = first(nomen, entities, trigger, args);	// Allow dynamic selection of entities
			}

			if(Array.isArray(first)) {
				[ entities ] = entities;	// Allow entire array to be passed as first argument, instead
			}

			const results = [];
			for(let entity of entities) {
				results.push(instance.trigger.call(instance, trigger, entity, ...args));
			}

			return results;
		}
	}
	/**
	 * Create a $ingleton reference in instances
	 */
	$(nomen, ...entities) {
		return System.$(nomen, ...entities);
	}

	constructor(nomen, triggers = [], opts = {}, agents) {
		super(agents, {
			triggers,
			config: {
				allowRPC: true,		//TODO Should pass invocations directly to methods, but verify it works
				allowMultipleHandlers: true,
				isReducer: false,
				generatePayload: false,
			},

			...opts,
		});

		this.nomen = nomen;		// System expects this to match a Component.nomen exactly
	}
};

export default System;