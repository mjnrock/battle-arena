import componentPosition from "./component-position";
import componentAbilities from "./component-abilities";

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
    ...componentAbilities,
};

export default schema;