import componentPosition from "./component-position";
import componentAbilities from "./component-abilities";

const schema = {
    ...componentPosition,
    type: {
        current: "FRIENDLY",
    },
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
    ...componentAbilities,
};

export default schema;