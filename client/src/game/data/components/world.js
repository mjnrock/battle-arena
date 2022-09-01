export function world({ world, model, x = 0, y = 0, vx = 0, vy = 0, speed = 1.5, facing = 0 } = {}) {
	return {
		/**
		 * This should either be a reference to the world or a UUID to find it
		 */
		world,

		/**
		 * The Shape of the entity in the world (e.g. a rectangle, circle, etc.)
		 */
		model,
		
		/**
		 * The degree of rotation of the entity, with EAST = 0, NORTH = 90, WEST = 180, SOUTH = 270
		 */
		facing,

		/**
		 * The x position of the entity in the world
		 */
		x,
		/**
		 * The y position of the entity in the world
		 */
		y,

		/**
		 * The x velocity of the entity in the world
		 */
		vx,
		/**
		 * The y velocity of the entity in the world
		 */
		vy,

		/**
		 * The speed of the entity in the world
		 */
		speed,

		/**
		 * Due to the complex nature of the world system, this creates a designated key-space for all
		 * things that require tracking something over time (e.g. changes in velocity, position, etc.)
		 * for uses like interpolation.
		 * 
		 * NOTE: This particular key-spaace is *not* intrinsically updated by the Game, and must be managed "manually".
		 */
		meta: {
			/**
			 * As "previous" is the most common use-case, stub this in with initialization values.
			 */
			previous: {
				world,
				x,
				y,
				vx,
				vy,
				speed,
				facing,
			},
		},
	};
};

export default world;