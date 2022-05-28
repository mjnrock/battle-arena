import Animus from "./Animus";

export class Node extends Animus {
    constructor({ terrain, physics = {} } = {}, agent = {}) {
        super({
			terrain,
			physics: {
				x: 0,
				y: 0,
				z: 0,
				...physics,
			},

			//? entity: via Components or State?  (cf. EntityManager, Collection)

		}, agent);
    }
}

export default Node;