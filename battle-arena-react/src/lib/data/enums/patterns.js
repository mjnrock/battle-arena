export const EnumPatternType = {
    SELF: (effect, magnitudeFn) => [[ 0, 0, effect, magnitudeFn ]],
    UP: (effect, magnitudeFn) => [[ 0, -1, effect, magnitudeFn ]],
    UP2: (effect, magnitudeFn) => [
        ...EnumPatternType.UP(effect, magnitudeFn),
        [ 0, -2, effect, magnitudeFn ],
    ],
    SURROUND:  (effect, magnitudeFn) => [
        [ 0, -1, effect, magnitudeFn ],
        [ -1, 0, effect, magnitudeFn ],
        [ 1, 0, effect, magnitudeFn ],
        [ 0, 1, effect, magnitudeFn ],
    ],
    SURROUND_PLUS:  (effect, magnitudeFn) => [
        [ 0, -1, effect, magnitudeFn ],
        [ -1, 0, effect, magnitudeFn ],
        [ 1, 0, effect, magnitudeFn ],
        [ 0, 1, effect, magnitudeFn ],

        [ 2, 2, effect, magnitudeFn ],
        [ 2, -2, effect, magnitudeFn ],
        [ -2, 2, effect, magnitudeFn ],
        [ -2, -2, effect, magnitudeFn ],
    ],
};

export default EnumPatternType;