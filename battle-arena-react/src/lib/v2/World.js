import Agency from "@lespantsfancy/agency";

import EntityManager from "./manager/EntityManager";
import { hasPosition as hasComponentPosition } from "./data/entity/components/position";

export class World extends Agency.Observable {
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        this.entities = new EntityManager();
        this.terrain = new Agency.Context({
            rules: {
                "*": (nv, v, { prop, target }) => {
                    return true;
                    // return nv instanceof Terrain;
                }
            }
        });
    }

    join(entity, ...synonyms) {
        if(!hasComponentPosition(entity)) {
            return false;
        }

        this.entities.register(entity, ...synonyms);

        return true;
    }
    leave(entity) {
        this.entities.unregister(entity);
    }

    //TODO  This needs to be refactored and potentially moved to a more appropriate place
    perform(entity, ability, { origin, targets } = {}) {
        if(hasComponentPosition(entity)) {
            return false;
        }

        if(!targets) {
            targets = this.entities.values;
        } else if(typeof targets === "function") {
            targets = targets(this.entities.values);
        }

        let ox, oy;
        if(Array.isArray(origin) && origin.length === 2) {
            [ ox, oy ] = origin;
        } else {
            ox = entity.position.x;
            oy = entity.position.y;
        }

        const afflictions = ability.invoke(ox, oy);
        if(Array.isArray(afflictions)) {
            const [ effects, x, y, { ignore, only } ] = afflictions;

            for(let target of targets) {
                //TODO  Add logical exclusions (e.g. death, invulnerability, etc.)
                if(hasComponentPosition(target)) {
                    if(target.position.x === null || target.position.y === null) {
                        // NOOP - ephemeral target
                    } else if(target.position.x === x && target.position.y === y) {
                        if(typeof ignore === "function" && ignore(target) === true) {
                            // NOOP - ignore target
                        } else if(typeof only === "function" && only(target) === false) {
                            // NOOP - ignore target
                        } else {
                            for(let effect of effects) {
                                effect.apply(target, entity);
                            }
                        }
                    }
                }
            }

            return true;
        }

        return false;
    }
}

export default World;