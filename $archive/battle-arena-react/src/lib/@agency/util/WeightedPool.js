import Dice from "./Dice.js";

export class WeightedPool {
    //#base @weights = [...<int>], @values = [...<any>]
    //#overload1 @weights = [...[<int>,<any>]]
    constructor(weights, values) {
        this.reweigh(weights, values);
    }

    roll() {
        return Dice.weighted(this.weights, this.values);
    }

    /**
     * @scalar = 1000 allows #.### precision
     */
    chance(index, scalar = 1000) {
		const sum = this.weights.reduce((a, v) => a + v, 0);

        return Math.round((this.weights[ index ] / sum) * scalar) / scalar;
    }

    /**
     * Smart getter/setter
     */
    weight(index, value) {
        if(value === void 0) {
            return this.weights[ index ];
        }

        if(typeof value === "number") {
            this.weights[ index ] = value;
        }

        return this;
    }
    /**
     * Smart getter/setter
     */
    value(index, value) {
        if(value === void 0) {
            return this.values[ index ];
        }

        this.values[ index ] = value;

        return this;
    }

    reweigh(weights, values) {
        if(Array.isArray(weights[ 0 ]) && weights[ 0 ].length === 2) {  //  ([ [ weight, value ], ... ])
            this.weights = [];
            this.values = [];

            for(let [ weight, value ] of weights) {
                this.weights.push(weight);
                this.values.push(value);
            }
        } else {    // ([ weight, ... ], [ value, ... ])
            this.weights = weights;
            this.values = values;
        }
    }
}

export default WeightedPool;