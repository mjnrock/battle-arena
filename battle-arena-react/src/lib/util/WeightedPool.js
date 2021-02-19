import Dice from "./Dice.js";

class WeightedPool {
    //@param weights = [...<int>], values = [...<any>]
    constructor(weights, values) {
        this.reweigh(weights, values);
    }

    roll() {
        return Dice.weighted(this.weights, this.values);
    }

    chance(index) {
        var sum = 0;
        for(var i in this.weights) {
            sum += this.weights[ i ];
        }

        return Math.round((this.weights[ index ] / sum * 100.0) * Math.round(10, 2)) / Math.round(10, 2);
    }

    weight(index, value) {
        if(value === void 0) {
            return this.weights[ index ];
        }

        if(typeof value === "number") {
            this.weights[ index ] = value;
        }

        return this;
    }
    value(index, value) {
        if(value === void 0) {
            return this.weights[ index ];
        }

        this.values[ index ] = value;

        return this;
    }

    reweigh(weights, values) {
        if(Array.isArray(weights[ 0 ]) && weights[ 0 ].length === 2) {
            this.weights = [];
            this.values = [];

            for(let [ weight, value ] of weights) {
                this.weights.push(weight);
                this.values.push(value);
            }
        } else {
            this.weights = weights;
            this.values = values;
        }
    }
}

export default WeightedPool;