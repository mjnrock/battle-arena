export function round(number, scalar = 10) {
    return Math.round(number * scalar) / scalar;
};

export default {
    round,
};