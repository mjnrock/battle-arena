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
	constructor ({ id, tags, middleware } = {}) {
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
		this.system.addClassifier(() => (k, v, e) => v._environment = this);
		/**
		 * Add a trivial classifier that attaches the environment to the entity.
		 */
		this.entity.addClassifier(() => (k, v, e) => v._environment = this);

		/**
		 * Assign the custom bundler, if provided, else use the default.
		 */
		this.middleware = middleware || this.middleware;
	}

	/**
	 * The middleware packing function whenever there is a dispatch.
	 * This is intended to be overridden, but will suffice as is, even
	 * if it is not.
	 */
	middleware(event, ...args) {
		return {
			env: this,
			event,
			args,
		};
	}

	/**
	 * Resolve the @path to a System instance, invoke .emit on
	 * that system, passing the results of the bundler, along
	 * with the arguments provided.
	 * 
	 *? This effectively allows for the use of the Environment
	 *? as a middleware-System-router, utilizing an overridable
	 *? bundler to customize the dispatch message.
	 */
	dispatch(path, ...args) {
		const [ module, event ] = path.split(".");
		const system = this.system[ module ];

		if(system && module && event) {
			/**
			 * The message is the result of the middleware bundler,
			 * those middleware can perform other work, too.
			 */
			const msg = this.middleware(event, ...args);

			return system.emit(event, msg, ...args);
		}
	}
};

export default Environment;