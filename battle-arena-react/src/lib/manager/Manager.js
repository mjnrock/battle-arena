import System from "../@agency/core/ecs/System";

/**
 ** The Manager is similar to a System, except that it keeps explicit track of Entities and Components that it is allowed to act on
 ** This concept is the starting point for EntityManager
 **/
export class Manager extends System {
    constructor(game, nomen) {
        super(nomen, [], {
			state: {
				game,
			},
		});
    }

	getGame() {
		return this.state.game;
	}
}

export default Manager;