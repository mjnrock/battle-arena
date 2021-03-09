import Agency from "@lespantsfancy/agency";

import Entity from "./../Entity";
import Registry from "./../util/Registry";
import Observer from "./../util/Observer";

export class EntityManager extends Registry {
    constructor(entities = []) {
        super();

        for(let entity of entities) {
            this.register(entity);
        }
    }    
    
    create(comps = [], ...synonyms) {
        const entity = Entity.FromSchema(comps);

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

export function Factory(entities = []) {
    return new EntityManager(entities);
};

export function SubjectFactory(entities = []) {
    return new Observer(EntityManager.Factory(entities));
};

EntityManager.Factory = Factory;
EntityManager.SubjectFactory = SubjectFactory;

export default EntityManager;