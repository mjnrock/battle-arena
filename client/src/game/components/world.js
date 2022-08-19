export function world({ world, model, x = 0, y = 0, vx = 0, vy = 0, ax = 0, ay = 0, speed = 1.5, facing = 0 } = {}) {
	return {
		/**
		 * This should either be a reference to the world or a UUID to find it
		 */
		world,

		/**
		 * The Shape of the entity in the world (e.g. a rectangle, circle, etc.)
		 */
		model,
		
		//TODO: These indentations exist in the @model, refactor these out
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
		 * The x acceleration of the entity in the world
		 */
		ax,
		/**
		 * The y acceleration of the entity in the world
		 */
		ay,

		/**
		 * The speed of the entity in the world
		 */
		speed,
	};
};

export default world;