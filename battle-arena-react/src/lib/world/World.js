import Context from "../@agency/core/Context";

export class World extends Context {
    constructor(game) {
        super([], {
			state: {
				game,
				nodes: [],
				entities: [],
			}
		});
    }

	getGame() {
		return this.state.game;
	}
}

export default World;