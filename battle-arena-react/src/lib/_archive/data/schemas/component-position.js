const schema = {
    position: (x, y, facing = 0) => ({
        facing,
        x: x || ~~(Math.random() * 25),
        y: y || ~~(Math.random() * 25),
    }),
};

export default schema;