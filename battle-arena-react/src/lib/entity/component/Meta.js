import Component from "./Component";

export const EnumEntityType = {
    CREATURE: "creature",
    TERRAIN: "terrain",
    GAIA: "gaia",
    ITEM: "item",
    PARTICLE: "particle",   // A render effect (e.g. sparkles)
    EFFECT: "effect",   // An ability effect (e.g. "movement.teleport")
    PORTAL: "portal",
    BUILDING: "building",
};

export const EnumEntityCreatureType = {
    SQUIRREL: "squirrel",
    BUNNY: "bunny",
    BEAR: "bear",
};

//TODO  Probably move aggression to something more specific than "meta"
export const EnumAggressionType = {
    PASSIVE: "passive",
    FRIENDLY: "friendly",
    NEUTRAL: "neutral",
    HOSTILE: "hostile",
};

export class Meta extends Component {
    static Name = "meta";
    static DefaultProperties = () => ({
        type: EnumEntityType.CREATURE,
        subtype: EnumEntityCreatureType.SQUIRREL,
        born: Date.now(),
        lifespan: Infinity,
    });

    constructor(game, entity, state = {}) {
        super(Meta.Name, game, entity, {
            ...Meta.DefaultProperties(),
            ...state,
        });
    }

    onPreTick(spf, now) {
        if(this.lifespan < Infinity) {
            if(now >= this.born + this.lifespan) {
                this.escalate("destroy", this.entity);
            }
        }
    }
};

export default Meta;