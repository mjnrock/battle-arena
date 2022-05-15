import Context from "./../@agency/core/Context";

export class Manager extends Context {
    constructor(game) {
        super([], {
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