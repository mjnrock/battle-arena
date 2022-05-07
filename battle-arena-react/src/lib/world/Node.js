import Entity from "../@agency/core/ecs/Entity";
import Position from "../data/ecs/component/Position";

export class Node extends Entity {
    constructor() {
        super([
			Position({
				seed: {
					x: () => Math.random(),
					y: () => Math.random(),
					z: () => Math.random(),
				},
			}),
		], { evaluateState: true });
    }
}

export default Node;