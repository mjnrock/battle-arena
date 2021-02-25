export default class Ability {
    constructor({ offsetX = 0, offsetY = 0, pattern, } = {}) {
        this.pattern = pattern;
        this.offset = {
            x: offsetX,
            y: offsetY,
        };
    }

    add(x, y, effect, magnitudeFn) {
        this.pattern.push([ x, y, effect, magnitudeFn ]);

        return this;
    }
    remove(x, y) {
        this.pattern = this.pattern.filter(([ xf, yf ]) => xf !== x && yf !== y);

        return this;
    }

    localPoint(x, y, { asArray = false } = {}) {
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

    perform(x = 0, y = 0) {
        const { x: xl, y: yl } = this.localPoint(x, y);
        const results = [];

        this.pattern.forEach(([ dx, dy, effect, magnitudeFn ]) => {
            results.push([ xl + dx, yl + dy, effect, magnitudeFn ]);
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