export default class Ability {
    constructor({ offset, pattern, } = {}) {
        this.offset = offset || {
            x: 0,
            y: 0,
        };
        this.pattern = pattern || [
            [ 0, 0, true ],
        ];
    }

    toLocalPoint(x, y, { asArray = false } = {}) {
        if(asArray === true) {
            return [
                x + this.offset.x,
                y + this.offset.y,
            ];
        }

        return {
            x: x + this.offset.x,
            y: y + this.offset.y,
        };
    }

    points(x0, y0) {
        const { x, y } = this.toLocalPoint(x0, y0);
        const results = [];

        this.pattern.forEach(([ dx, dy, effect]) => {
            results.push([ x + dx, y + dy, effect ]);
        });

        return results;
    }

    static FromSchema(schemaOrObj, schemaParamObject = {}) {
        let ability = new Ability();
        for(let [ key, value ] of Object.entries(schemaOrObj)) {
            if(typeof value === "function") {
                ability[ key ] = value(...(schemaParamObject[ key ] || []));
            } else {
                ability[ key ] = value;
            }
        }
    
        return ability;
    }
}