import System from "../../lib/@agency/core/ecs/System";

/**
 * A small wraper for Agency's System class, necessitating the inclusion of the
 * @game argument.
 * 
 * All extensions should include a static property called `Events` which is an
 * object containing the event names and their respective handlers.
 */
export class ASystem extends System {
	constructor (game, events = {}, agent = {}) {
		super(agent);

		this.game = game;

		if(!Object.keys(this.constructor.Events || {}).length) {
			throw new Error(`[Useless System]: Assign an event object to << ${ this.constructor.name }.Events >>`);
		}

		this.addEventsByObject({
			...this.constructor.Events,
			...events,
		});
	}
};

export default ASystem;