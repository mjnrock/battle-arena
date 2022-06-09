export const Bitwise = {
    add(base, ...flags) {
        flags.forEach(flag => {
            base |= flag;
        });

        return base;
    },    
    remove(base, ...flags) {
        flags.forEach(flag => {
            base &= ~flag;
        });

        return base;
    },    
    has(base, ...flags) {
        let result = true;
        flags.forEach(flag => {
            result = result && !!(base & flag);
        });
        
        return result;
    }
};

export default Bitwise;