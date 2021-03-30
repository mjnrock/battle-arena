// import Agency from "@lespantsfancy/agency";
// import Agency from "./../util/agency/package";
import Registry from "./../util/agency/Registry";

import Entity from "./../Entity";

export class EntityManager extends Registry {
    constructor(entities = []) {
        super(entities);
    }
    
    create(comps = [], ...synonyms) {
        const entity = Entity.FromSchema(comps);

        this.$.register(entity, ...synonyms);

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

export function Factory(entities = []) {
    return new EntityManager(entities);
};

EntityManager.Factory = Factory;

export default EntityManager;