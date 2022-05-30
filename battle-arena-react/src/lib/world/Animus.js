import Entity from "../@agency/core/ecs/Entity";

import Physics from "../data/ecs/struct/Physics";

/**
 * In this game, "Entity" is relabeled "Animus" to distinguish a "Game Entity" from an "Agency.ECS.Entity"
 */
export class Animus extends Entity {
	static Nomen = "animus";
	
    constructor(components = [], agent = {}) {
        super(components, agent);

		this.addComponent(Physics.Nomen);
    }
}

export default Animus;