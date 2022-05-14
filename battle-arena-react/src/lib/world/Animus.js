import Entity from "../@agency/core/ecs/Entity";

/**
 * In this game, "Entity" is relabeled "Animus" to distinguish a "Game Entity" from an "Agency.ECS.Entity"
 */
export class Animus extends Entity {
	static Nomen = "animus";
	
    constructor(components = [], agent = {}) {
        super(components, agent);
    }
}

export default Animus;