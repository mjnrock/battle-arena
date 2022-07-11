import Registry from "../Registry";

/**
 * Within an Entity descendant, the Components property is a map of component names to component generators.
 * These represent the default components for that Entity.  Additional components can be added to the Entity
 * by passing them to the @components parameter upon instantiation.  The default components can be seeded
 * with data by passing them to the @args parameter, as well.
 * 
 * NOTE: Any "root level" function will **always** be evaluated and the local result will be wrapped in an
 * array so that all arguments can be spread into the component generator; therefore, explicitly pass that
 * array to prevent function evaluation in those cases.
 */
export class Entity extends Registry {
	static Components = {};

	constructor ({ components = {}, name, id, tags, init = {} } = {}) {
		super([], { id, tags });

		this.name = name;

		this.register(components);

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

			this.register({
				[ name ]: comp(...largs),
			});
		}
	}

	/**
	 * Factory method for creating new Entities.
	 * 
	 * NOTE: This will **always** evaluate the root-level functions
	 * within the @components parameter, so as not to create collisions.
	 */
	static Factory(qty = 1, { components = {}, ...rest } = {}) {
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
				} else if("next" in input) {
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

			return entity;
		});
	}
};

export default Entity;