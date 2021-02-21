const schema = {
    abilities: (current, ...rest) => {
        const obj = {
            current,
            all: [
                ...rest,
            ],
        };

        if(current) {
            obj.all.unshift(current);
        }

        return obj;
    },
};

export default schema;