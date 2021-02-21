export const EnumSchemaTemplate = {
    SELF: (effect) => [[ 0, 0, effect ]],
    UP: (effect) => [[ 0, -1, effect ]],
    UP2: (effect) => [
        ...EnumSchemaTemplate.UP(effect),
        [ 0, -2, effect ],
    ],
    SURROUND:  (effect) => [
        [ 0, -1, effect ],
        [ -1, 0, effect ],
        [ 1, 0, effect ],
        [ 0, 1, effect ],
    ],
    SURROUND_PLUS:  (effect) => [
        [ 0, -1, effect ],
        [ -1, 0, effect ],
        [ 1, 0, effect ],
        [ 0, 1, effect ],

        [ 2, 2, effect ],
        [ 2, -2, effect ],
        [ -2, 2, effect ],
        [ -2, -2, effect ],
    ],
};

const schema = [
    ...EnumSchemaTemplate.SELF(true),
];

export default schema;