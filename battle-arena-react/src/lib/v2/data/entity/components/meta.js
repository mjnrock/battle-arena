//! Component Schemas should always be functions
const _name = "meta";

export const EnumEntityType = {
    SQUIRREL: "squirrel",
    BUNNY: "bunny",
    BEAR: "bear",
}

export const schema = {
    [ _name ]: ({ type = EnumEntityType.SQUIRREL } = {}) => ({
        type,
    }),
};

export function hasMeta(entity = {}) {
    return _name in entity;
}

export default schema;