import Registry from "../Registry";

export class Entity extends Registry {
	constructor (components = {}, { id, tags } = {}) {
		super([], { id, tags });

		this.register(components);
	}

	/**
	 * If @components contains the pair { $eval: true }, then any value that is a
	 * function will be
	 */
	static Factory(qty = 1, components = {}, { tags, ...rest } = {}) {
		return new Array(qty).fill(0).map(() => {
			const entity = new this([], { tags, ...rest });
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
			}

			return entity;
		});
	}
};

export default Entity;