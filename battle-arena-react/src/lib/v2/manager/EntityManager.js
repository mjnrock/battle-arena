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
}

export default EntityManager;