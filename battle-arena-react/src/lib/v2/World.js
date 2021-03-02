import Agency from "@lespantsfancy/agency";

export class World extends Agency.Observable {
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        this.entities = new Agency.Registry();
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
        this.entities.register(entity, ...synonyms);
        
        entity.onTurn();
    }
    leave(entity) {
        this.entities.unregister(entity);

        entity.offTurn();
    }

    select(filter) {
        if(typeof filter === "function") {
            return filter(this.entities.values);
        }

        return [];
    }

    //? Every <Entity> in <World> should have the "position" component
    perform(entity, ability, { origin, targets } = {}) {
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
                // if(target is logically excluded (e.g. dead, invulnerable, etc.), but not so specific to the <Ability>) {
                //     // NOOP
                // }
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

            return true;
        }

        return false;
    }
}

export default World;