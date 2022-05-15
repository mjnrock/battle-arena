import Animus from "./Animus";

export class Node extends Animus {
    constructor({ terrain, position = {} } = {}, agent = {}) {
        super({
			terrain,
			position: {
				x: 0,
				y: 0,
				z: 0,
				...position,
			},

			//? entity: via Components or State?

		}, agent);
    }
}

export default Node;