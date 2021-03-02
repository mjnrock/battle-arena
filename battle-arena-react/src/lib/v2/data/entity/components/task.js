import Agency from "@lespantsfancy/agency";

//! Component Schemas should always be functions
const _name = "task";

export const schema = {
    [ _name ]: (timeout) => ({
        timeout,
        timeoutStart: 0,
    }),
};

export function hasTask(entity = {}) {
    return _name in entity;
}

export default schema;