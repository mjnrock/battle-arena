// import Relay from "@lespantsfancy/relay";
import { Identity } from "../Identity";
import { Registry } from "../Registry";

/**
 * The Environment is a kindred-spirit of the Registry, but instead provides a
 * generalized namespace and context-space for ECS-related data.  As such,
 * it can be embedded, nested, or extended to create a more complex ECS environment,
 * or it can simply be used as a single source-of-truth for an ECS context.
 * 
 * NOTE: The Environment uses the singular case for namespacing, as the selection syntax
 * is meant to resolve singularly (e.g. "this particular entity").
 */
export class Environment extends Identity {
	constructor ({ id, tags, middleware, state = {} } = {}) {
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
			/**
			 * The main generator repository for Systems.
			 */
			system: new Registry(),
			/**
			 * The main generator repository for Entities.
			 */
			entity: new Registry(),
			/**
			 * The main generator repository for Components.
			 */
			component: new Registry(),
		};

		/**
		 * Add a trivial classifier that attaches the environment to the system.
		 */
		this.system.registerClassifiers(
			Registry.Middleware.AttachRef(this, "_environment"),
		);
		/**
		 * Add a trivial classifier that attaches the environment to the entity.
		 */
		this.entity.registerClassifiers(
			Registry.Middleware.AttachRef(this, "_environment"),
		);

		/**
		 * Assign the custom bundler, if provided, else use the default.
		 */
		this.middleware = middleware || this.middleware;

		/**
		 * * Optionally utilize a state, when needed.
		 * Because of the potential complexity of the Environment,
		 * a dedicated state space is provided for it.  If any configuration
		 * is required (e.g. settings), it can be done here.
		 * 
		 * ? Since the middleware ought to pass the Environment as a reference,
		 * ? any invocation could be used as a reducer.
		 */
		this.state = state;
	}

	/**
	 * A convenience method for setting the state.
	 * 
	 * NOTE: This will invoke the middleware with a "state" event,
	 * passing the state object, which can theorically be used to
	 * modify @state in between.
	 */
	setState(state = {}) {
		this.middleware("state", state);

		this.state = state;

		return this.state;
	}
	/**
	 * A convenience method for merging @state into the state.
	 * 
	 * NOTE: This will invoke the middleware with a "state" event,
	 * passing the state object, which can theorically be used to
	 * modify @state in between.
	 */
	mergeState(state = {}) {
		this.middleware("state", state);

		this.state = {
			...this.state,
			...state,
		};

		return this.state;
	}

	/**
	 * The middleware packing function whenever there is a .dispatch.
	 * This is intended to be overridden, but will suffice as is, even
	 * if it is not.
	 */
	middleware(event, entities, ...args) {
		return {
			env: this,
			event,
			entities,
			args,
		};
	}

	_registrationFactoryHelper(environment, results) {
		return Object.fromEntries(results.map(e => [
			/**
			 * Create an entry object with e.Nomen as the key
			 */
			e.Nomen,

			/**
			 * Wrap the Entity constructor in a factory function
			 */
			(qty, ...args) => {
				const entities = [];
				for(let i = 0; i < qty; i++) {
					const next = new e(...args);

					//TODO: Cleanup any Entities from the environment that are no longer valid, as needed.
					environment.entity.add(next);

					entities.push(next);
				}

				return entities;
			},
		]));
	};
	registerFactorySystems(systems, ...args) {
		if(!Array.isArray(systems)) {
			systems = [ systems ];
		}

		this.factory.system.registerMany(this._registrationFactoryHelper(this, systems));

		for(let [ id, factory ] of this.factory.system) {
			const [ system ] = factory(1, ...args);

			/**
			 * This will become the "selection key" for this system.
			 */
			this.system.registerWithAlias(system, system.constructor.Nomen);
			// this.system.registerWithAlias(system, system.constructor.name);
		}
	}
	registerFactoryEntities(entities) {
		if(!Array.isArray(entities)) {
			entities = [ entities ];
		}

		this.factory.entity.registerMany(this._registrationFactoryHelper(this, entities));
	}
	registerFactoryComponents(components) {
		if(!Array.isArray(components)) {
			components = [ components ];
		}

		this.factory.component.registerMany(this._registrationFactoryHelper(this, components));
	}

	/**
	 * Resolve the @path to a System instance, invoke .emit on
	 * that system, passing the results of the bundler, along
	 * with the arguments provided.
	 * 
	 *? This effectively allows for the use of the Environment
	 *? as a middleware-System-router, utilizing an overridable
	 *? bundler to customize the dispatch message.
	 *
	 * e.g.: ("World.move", $Entity.player, { x: 1, y: -1, delta: true })
	 */
	dispatch(path, entities, ...args) {
		const [ module, event ] = path.split(":");
		const system = this.system[ module ];

		if(system && module && event) {
			/**
			 * The message is the result of the middleware bundler,
			 * those middleware can perform other work, too.
			 */
			//TODO: Reconcile the middleware with the environment/system hand-off.  (i.e. Most Systems do not expect any "general" arguments (e.g. a msg, environment, etc.))
			const msg = this.middleware(event, entities, ...args);

			return system.dispatch(msg.event, msg.entities, ...msg.args);
		}
	}
};

export default Environment;