import NodeManager from "../manager/NodeManager";
import Animus from "./Animus";

export class World extends Animus {
    constructor(game, size = []) {
        super([], {
			state: {
				game,
				width: size[ 0 ],
				height: size[ 1 ],
				nodes: NodeManager.Initialize(game, size),
				entities: [],
			}
		});

		// this.state.nodes

		this.registerComponent({

		});
    }

	get size() {
		return this.state.width * this.state.height;
		// return [ this.state.width, this.state.height ];
	}

	getGame() {
		return this.state.game;
	}
}

export default World;