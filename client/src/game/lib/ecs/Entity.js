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

	constructor ({ components = {}, name, id, tags, args } = {}) {
		super([], { id, tags });

		this.name = name;

		this.register(components);

		/**
		 * Register the default components
		 */
		for(let [ name, comp ] of Object.entries(this.constructor.Components)) {
			let largs = args[ name ];

			if(typeof largs === "function") {
				largs = largs(this);
			}

			if(!Array.isArray(largs)) {
				largs = [ largs ];
			}

			this.registerWithName(comp(...largs));
		}
	}

	/**
	 * If @components contains the pair { $eval: true }, then any value that is a
	 * function will be
	 */
	static Factory(qty = 1, { components = {}, tags, ...rest } = {}) {
		return new Array(qty).fill(0).map(() => {
			const entity = new this({ components: [], tags, ...rest });
			const next = { ...components };

			if("$eval" in next && next[ "$eval" ] === true) {
				delete next[ "$eval" ];

				let i = 0;
				for(let [ name, input ] of Object.entries(next)) {
					if(typeof input === "function") {
						entity.register({
							[ name ]: input(i, entity),
						});
					} else {
						entity.register({
							[ name ]: input,
						});
					}

					i++;
				}
			} else {
				entity.register(next);
			}

			return entity;
		});
	}
};

export default Entity;