import Component from "./Component";

export const EnumEntityType = {
    CREATURE: "creature",
    TERRAIN: "terrain",
    GAIA: "gaia",
    ITEM: "item",
    EFFECT: "effect",
    ACTION: "action",
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
    });

    constructor(game, entity, state = {}) {
        super(Meta.Name, game, entity, {
            ...Meta.DefaultProperties(),
            ...state,
        });
    }
};

export default Meta;