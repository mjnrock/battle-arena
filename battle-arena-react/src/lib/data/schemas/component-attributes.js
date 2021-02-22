import Value from "./../../Value";
import Experience from "./../../Experience";

const schema = {
    attributes: (...args) => ({
        ATK: Math.random() * 10,
        DEF: Math.random() * 10,
        HP: new Value(10, { min: 0, max: 10 }),
        XP: new Experience(0, { formula: (level) => level * 1000 }),
    }),
};

export default schema;