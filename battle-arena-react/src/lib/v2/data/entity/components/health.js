import Value from "../../../util/Value";

//! Component Schemas should always be functions
const _name = "health";

export const schema = {
    [ _name ]: ({ current, max, min = 0} = {}) => ({
        value: new Value(current, { min, max }),
    }),
};

export function hasHealth(entity = {}) {
    return _name in entity;
}

export default schema;