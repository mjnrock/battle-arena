import { random } from "../ai/random";

//! Component Schemas should always be functions
const _name = "turn";

export const schema = {
    [ _name ]: ({ current = random, timeout, timeoutStart = 0 } = {}) => ({
        current,
        timeout,
        timeoutStart,
    }),
};

export function hasTurn(entity = {}) {
    return _name in entity;
}

export default schema;