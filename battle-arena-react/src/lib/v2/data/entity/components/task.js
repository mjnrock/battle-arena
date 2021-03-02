//! Component Schemas should always be functions
const _name = "task";

export const schema = {
    [ _name ]: (timeout) => ({
        timeout,
    }),
};

export function hasTask(entity = {}) {
    return _name in entity;
}

export default schema;