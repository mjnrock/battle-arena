import Identity from "../Identity";

/**
 * Within an Entity descendant, the Components property is a map of component names to component generators.
 * These represent the default components for that Entity.  Additional components can be added to the Entity
 * by passing them to the @components parameter upon instantiation.  The default components can be seeded
 * with data by passing them to the @init parameter, as well.
 * 
 * NOTE: Any "root level" function will **always** be evaluated and the local result will be wrapped in an
 * array so that all arguments can be spread into the component generator; therefore, explicitly pass that
 * array to prevent function evaluation in those cases.
 */
export class Entity extends Identity {
	static Alias = "entity";
	static Components = {};

	constructor ({ components = {}, alias, id, tags, init = {} } = {}) {
		super([], { id, tags });

		/**
		 * A class-unique name for the Entity
		 */
		this.alias = alias || this.constructor.Alias;

		/**
		 * Register all of the components and seed them with data from @init
		 */
		this.register(this.constructor.Components, init);
		this.register(components, init);
	}

	register(comps, init = {}) {
		const nextComps = Array.isArray(comps) ? comps.map((a, i) => [ a.name || a.constructor.name, a ]) : Object.entries(comps);
		for(let [ name, comp ] of nextComps) {
			let largs = init[ name ];

			if(typeof largs === "function") {
				largs = largs(this);
			}

			if(!Array.isArray(largs)) {
				largs = [ largs ];
			}

			if(Identity.Comparators.IsClass(comp) && !Identity.Comparators.IsInstance(comp)) {
				this[ name ] = new comp(...largs);
			} else if(typeof comp === "function") {
				this[ name ] = comp(...largs);
			} else {
				this[ name ] = comp;
			}
		}
	}
	unregister(...keys) {
		for(let key of keys) {
			delete this[ key ];
		}
	}

	/**
	 * Clean up the Entity before GC
	 */
	deconstructor(cascade = false) {
		super.deconstructor();

		for(let key of Object.keys(this)) {
			const value = this[ key ];
			/**
			 * Optionally destroy any properties with a "deconstructor" method
			 */
			if(cascade) {
				/**
				 * If a .deconstructor() method exists, call it
				 */
				if(typeof this[ key ] === "object" && "deconstructor" in this[ key ]) {
					value.deconstructor(cascade);
				}
			}
		}

		this.unregister(...Object.keys(this));
	}

	/**
	 * Factory method for creating new Entities.
	 * 
	 * NOTE: This will **always** evaluate the root-level functions
	 * within the @components parameter, so as not to create collisions.
	 */
	static Factory(qty = 1, { components = {}, each, ...rest } = {}) {
		return new Array(qty).fill(0).map(() => {
			const entity = new this({ components: [], ...rest });
			const next = { ...components };

			let i = 0;
			for(let [ name, input ] of Object.entries(next)) {
				if(typeof input === "function") {
					/**
					 * Evaluate any root-level functions
					 */
					entity[ name ] = input(i, entity);
				} else if(typeof input === "object" && "next" in (input || {})) {

					/**
					 * Assume its a generator*
					 */
					entity[ name ] = input.next().value;
				} else {
					/**
					 * Take value as-is
					 */
					entity[ name ] = input;
				}

				i++;
			}

			if(each) {
				each(entity, i);
			}

			return entity;
		});
	}
};

export default Entity;