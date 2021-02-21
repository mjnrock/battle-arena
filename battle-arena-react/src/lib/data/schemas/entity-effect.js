import componentPosition from "./component-position";

const schema = {
    ...componentPosition,
    type: {
        current: "EFFECT",
    },
    condition: (cond) => ({
        current: cond || "IDLE",
    }),
};

export default schema;