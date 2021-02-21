import componentPosition from "./component-position";

const schema = {
    ...componentPosition,
    attributes: (...args) => ({
        ATK: Math.random() * 10,
        DEF: Math.random() * 10,
        HP: {
            current: 10,
            max: 10,
        },
        XP: {
            current: 0,
            max: 100,
            level: 1,
        },
    }),
    condition: (cond) => ({
        current: cond || "IDLE",
    }),
    abilities: (current, ...rest) => ({
        current: current || {
            name: "attack",
            range: [ 1, "facing" ],
        },
        all: [
            current,
            ...rest,
        ],
    })
};

export default schema;