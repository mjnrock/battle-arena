/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import Game from "./../Game";
import Entity from "./../Entity";
import Ability from "./../Ability";

import entitySchema from "./../data/schemas/entity";
import entityZombieSchema from "./../data/schemas/entity-zombie";
import { EnumSchemaTemplate as EnumPatternType } from "./../data/schemas/patterns";

export default class EntityManager extends Agency.Registry {
    constructor(game) {
        super({
            game,
        });
    }

    addGame(game) {
        if(game instanceof Game) {
            this.game = game;        

            this.game.entities.create(entitySchema, {
                position: [ 3, 3 ],
                abilities: [
                    new Ability({ pattern: EnumPatternType.SELF(true) }),
                    new Ability({ pattern: EnumPatternType.UP(true) }),
                    new Ability({ pattern: EnumPatternType.UP2(true) }),
                    new Ability({ pattern: EnumPatternType.SURROUND(true) }),
                    new Ability({ pattern: EnumPatternType.SURROUND_PLUS(true) }),
                ]
            }, "player");
            this.game.entities.spawn(5, entityZombieSchema);
        }
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