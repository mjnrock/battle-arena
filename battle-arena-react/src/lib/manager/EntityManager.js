/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import Game from "./../Game";
import Entity from "./../Entity";
import Ability from "./../Ability";
import Effect from "./../Effect";

import entitySchema from "./../data/schemas/entity";
import entityZombieSchema from "./../data/schemas/entity-zombie";
import entityEffectSchema from "./../data/schemas/entity-effect";
import { EnumPatternType as EnumPatternType } from "../data/enums/patterns";
import effectDamageSchema from "../data/schemas/effect-damage";
import effectHealSchema from "../data/schemas/effect-heal";

export default class EntityManager extends Agency.Registry {
    constructor(game) {
        super({
            game,
        });

        this.addGame(game);

        console.log(Agency.Util.Dice.d25())
    }

    addGame(game) {
        if(game instanceof Game) {
            this.game = game;        

            this.game.entities.create(entitySchema, {
                position: [ 3, 3 ],
                abilities: [
                    new Ability({ pattern: EnumPatternType.SELF(Effect.FromSchema(effectHealSchema), 2) }),
                    new Ability({ pattern: EnumPatternType.UP(Effect.FromSchema(effectDamageSchema), 3) }),
                    new Ability({ pattern: EnumPatternType.UP2(Effect.FromSchema(effectDamageSchema), () => 15) }),
                    new Ability({ pattern: EnumPatternType.SURROUND(Effect.FromSchema(effectHealSchema), 2) }),
                    new Ability({ pattern: EnumPatternType.SURROUND_PLUS(Effect.FromSchema(effectDamageSchema), 3) }),
                ]
            }, "player");
            
            this.game.entities.spawn(10, entityZombieSchema);

            //  Process results of the tick update
            new Agency.Observer(this.game, function() {  //  @this will be <Game>
                const now = Date.now();
                for(let entity of this.entities.values) {
                    if(entity.components.type.current === "EFFECT" && (now - entity._born) > 350) {
                        this.entities.destroy(entity);
                    } else if(entity.components.attributes && entity.components.attributes.HP.current <= 0) {
                        this.entities.destroy(entity);
                    }

                    if(entity.components.type.current === "HOSTILE" && Agency.Util.Dice.random(1, 100) > 98) {
                        this.entities.useAbility(entity, 0);
                    }
                }
            });
        }
    }
    
    useAbility(entity, key) {
        if(!entity.components.abilities.all[ key ]) {
            return;
        }

        const points = entity.components.abilities.all[ key ].perform(entity.components.position.x, entity.components.position.y);
        for(let [ x, y, effect, magnitudeFn ] of points) {
            const entity = Entity.FromSchema(entityEffectSchema, {
                position: [ x, y ],
                condition: [ effect.type === 1 ? "ATTACKING" : "IDLE" ],    // Debug way to render different colors
            });
            this.game.entities.register(entity);

            for(let e of this.game.entities.values) {
                if(e.components.type.current !== "EFFECT" && e.components.position.x === x && e.components.position.y === y) {
                    if(typeof magnitudeFn === "function") {
                        effect.affect(e, magnitudeFn(e, entity));       // Dynamically calculate magnitude based on target and/or source entity
                    } else if(!Number.isNaN(+magnitudeFn)) {
                        effect.affect(e, +magnitudeFn);     // Numerically declare magnitude
                    } else {
                        effect.affect(e);   // Magnitude not relevant to this effect (e.g. kill, teleport, etc.);
                    }
                }
            }
        }
    }

    destroy(entity) {
        this.unregister(entity);
    }

    create(schema, args = {}, ...synonyms) {
        const entity = Entity.FromSchema(schema, args);

        super.register(entity, ...synonyms);

        return entity;
    }
    spawn(qty, schema, args = {}, ...synonyms) {
        const entities = [];
        for(let i = 0; i < qty; i++) {
            entities.push(this.create(schema, {
                //FIXME Debug code
                position: [ Agency.Util.Dice.d25(1, -1), Agency.Util.Dice.d25(1, -1) ],
                abilities: [
                    new Ability({ pattern: EnumPatternType.SURROUND(Effect.FromSchema(effectDamageSchema), 2) }),
                ],
                ...args,
            }, ...synonyms));
        }
        
        return entities;
    }
}