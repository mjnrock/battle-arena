// import Agency from "@lespantsfancy/agency";
// import Agency from "./../util/agency/package";
// import Registry from "./../util/agency/Registry";
import Registry from "./../util/Registry";

import Entity from "./../Entity";

export class EntityManager extends Registry {
    constructor(game, entities = []) {
        super(entities);

        this.__game = game;
    }

    get game() {
        return this.__game;
    }
    
    create(comps = [], ...synonyms) {
        const entity = Entity.FromSchema(this.game, comps);

        this.register(entity, ...synonyms);

        return entity;
    }
    createMany(qty, comps = [], synonymFunction) {
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
            return this.values.filter(filter);
        }

        return [];
    }
}

export function Factory(game, entities = []) {
    return new EntityManager(game, entities);
};

EntityManager.Factory = Factory;

export default EntityManager;