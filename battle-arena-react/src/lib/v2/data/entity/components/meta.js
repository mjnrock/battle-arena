//! Component Schemas should always be functions
const _name = "meta";

export const EnumEntityType = {
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

export const schema = {
    [ _name ]: ({ type = EnumEntityType.SQUIRREL, vision = 3 } = {}) => ({
        type,
        vision,
        // vision: new Circle(0, 0, vision),    //TODO Move vision and other senses to a specific component; improve Shape interactions
    }),
};

export function hasMeta(entity = {}) {
    return _name in entity;
}

export default schema;