import System from "./../../lib/@agency/lib/ecs/System";

/**
 * A small wraper for Agency's System class, necessitating the inclusion of the
 * @game argument.
 * 
 * All extensions should include a static property called `Events` which is an
 * object containing the event names and their respective handlers.
 */
export class ASystem extends System {
	/**
	 * These events and handlers will be used by default by the system and
	 * must have at least one (1) entry, or else the system will throw an error.
	 */
	static Events = {};

	constructor (game, events = [], agent = {}) {
		super(agent);

		/**
		 * Hold a reference to the game instance.
		 */
		this.game = game;

		/**
		 * Necessitate the overriding of the `Events` property.
		 */
		if(!Object.keys(this.constructor.Events || {}).length) {
			throw new Error(`[Useless System]: Assign an event object to << ${ this.constructor.name }.Events >>`);
		}

		/**
		 * Add the default events, along with the arguments passed in.
		 */
		this.seed({
			...this.constructor.Events,
			...events,
		});
	}
};

export default ASystem;