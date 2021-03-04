import Agency from "@lespantsfancy/agency";

import Entity from "./../Entity";

export class EntityManager extends Agency.Registry {
    constructor() {
        super();        
    }    
    
    create(comps = [], ...synonyms) {
        const entity = Entity.FromSchema(comps);

        this.register(entity, ...synonyms);

        return entity;
    }
    spawn(qty, comps = [], synonymFunction) {
        const entities = [];
        for(let i = 0; i < qty; i++) {
            const synonyms = typeof synonymFunction === "function" ? synonymFunction(i) : null;

            if(Array.isArray(synonyms)) {
                entities.push(this.create(comps, ...synonyms));
            } else if(synonyms) {
                entities.push(this.create(comps, synonyms));
            } else {
                entities.push(this.create(comps));
            }
        }
        
        return entities;
    }

    select(filter) {
        if(typeof filter === "function") {
            return filter(this.values);
        }

        return [];
    }

    //? Every <Entity> in <World> should have the "position" component
    perform(entity, ability, { origin, targets } = {}) {
        if(!targets) {
            targets = this.values;
        } else if(typeof targets === "function") {
            targets = targets(this.values);
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

export default EntityManager;