import componentPosition from "./component-position";

const schema = {
    ...componentPosition,
    type: {
        current: "HOSTILE",
    },
    attributes: (...args) => ({
        ATK: 2,
        DEF: 1,
        HP: {
            current: 5,
            max: 5,
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
        current,
        all: [
            current,
            ...rest,
        ],
    })
};

export default schema;