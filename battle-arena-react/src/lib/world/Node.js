import Animus from "./Animus";

export class Node extends Animus {
    constructor({ terrain } = {}, agent = {}) {
        super({
			terrain: {
				terrain,
			},
			position: {
				x: () => Math.random(),
				y: () => Math.random(),
				z: () => Math.random(),
			}
		}, agent);
    }
}

export default Node;