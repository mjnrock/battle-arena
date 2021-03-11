//! Component Schemas should always be functions
const _name = "movement";

export const schema = {
    [ _name ]: ({ destination = [], path = [] } = {}) => ({
        destination,
        path,
    }),
};

export function hasAction(entity = {}) {
    return _name in entity;
}

export default schema;