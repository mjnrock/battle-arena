import componentPosition from "./component-position";
import componentAbilities from "./component-abilities";
import componentAttributes from "./component-attributes";

const schema = {
    ...componentPosition,
    type: {
        current: "FRIENDLY",
    },
    ...componentAttributes,
    condition: (cond) => ({
        current: cond || "IDLE",
    }),
    ...componentAbilities,
};

export default schema;