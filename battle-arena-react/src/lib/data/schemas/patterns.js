export const EnumSchemaTemplate = {
    SELF: (effect) => [ 0, 0, effect ],
    UP: (effect) => [ 0, -1, effect ],
    UP2: (effect) => [
        ...EnumSchemaTemplate.UP(effect),
        [ 0, -2, effect ],
    ],
};

const schema = [
    [ 0, 0, true ],
];

export default schema;