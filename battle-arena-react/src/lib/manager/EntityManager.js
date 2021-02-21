/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import Entity from "../Entity";

export default class EntityManager extends Agency.Registry {
    constructor(game) {
        super({
            game,
        });
    }

    create(schema, args = {}, ...synonyms) {
        const entity = Entity.FromSchema(schema, args);

        super.register(entity, ...synonyms);

        return entity;
    }
    spawn(qty, schema, args = {}, ...synonyms) {
        const entities = [];
        for(let i = 0; i < qty; i++) {
            entities.push(this.create(schema, args, ...synonyms));
        }
        
        return entities;
    }
}