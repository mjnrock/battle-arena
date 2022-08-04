import Identity from "../Identity";
import Registry from "../Registry";

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
export class Entity extends Registry {
	static Name = "entity";
	static Components = {};

	constructor ({ components = {}, nomen, id, tags, init = {}, ...rest } = {}) {
		super([], { id, tags });

		/**
		 * A class-unique name for the Entity
		 */
		this.nomen = nomen;

		/**
		 * Register any components passed during instantiation
		 */
		this.register(components);

		/**
		 * If rest was populated with state, register each key/value pair
		 * This is useful for initializing the Entity with methods or additional properties.
		 */
		for(let [ key, value ] of Object.entries(rest)) {
			if(typeof value === "function") {
				this[ key ] = value;
			}
		}

		/**
		 * Register the default components
		 */
		const defaultComps = Array.isArray(this.constructor.Components) ? this.constructor.Components : Object.entries(this.constructor.Components);
		for(let [ name, comp ] of defaultComps) {
			let largs = init[ name ];

			if(typeof largs === "function") {
				largs = largs(this);
			}

			if(!Array.isArray(largs)) {
				largs = [ largs ];
			}

			if(Identity.Comparators.IsClass(comp) && !Identity.Comparators.IsInstance(comp)) {
				this.register({
					[ name ]: new comp(...largs),
				});
			} else if(typeof comp === "function") {
				this.register({
					[ name ]: comp(...largs),
				});
			} else {
				this.register({
					[ name ]: comp,
				});
			}
		}
	}

	/**
	 * Clean up the Entity before GC
	 */
	deconstructor(cascade = false) {
		for(let key of Object.keys(this)) {
			const value = this[ key ];
			/**
			 * Unregisters (via :Registry) all components and destroys all properties/methods
			 */
			this.remove(key);

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
					entity.register({
						[ name ]: input(i, entity),
					});
				} else if(typeof input === "object" && "next" in (input || {})) {

					/**
					 * Assume its a generator*
					 */
					entity.register({
						[ name ]: input.next().value,
					});
				} else {
					/**
					 * Take value as-is
					 */
					entity.register({
						[ name ]: input,
					});
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