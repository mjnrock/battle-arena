import Component from "./Component";

export const EnumEntityType = {
    TERRAIN: "terrain",

    SQUIRREL: "squirrel",
    BUNNY: "bunny",
    BEAR: "bear",
    
    TREE: "tree",
    STUMP: "stump",
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
        type: EnumEntityType.SQUIRREL,
    });

    constructor(game, entity, state = {}) {
        super(Meta.Name, game, entity, {
            ...Meta.DefaultProperties(),
            ...state,
        });
    }
};

export default Meta;