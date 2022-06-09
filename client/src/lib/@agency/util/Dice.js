export const Dice = {
	random: (min, max) => {
        if(min == null) {
            return Math.random();
        }

		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	ratio: (min, max) => {
		return (Dice.random(min, max) - min) / (max - min);
	},
    rate: (min, max, threshold = 0.500) => {
        return Dice.ratio(min, max) <= threshold;
    },
    /**
     * A convenience function to calculate irregular chances.
     * @scalar truncates the precision of the randomization.
     */
    chance: (min, max, threshold = 0.5, scalar = 10000) => {
        return Math.round(this.ratio(min, max) * scalar) / scalar <= threshold;
    },

    /**
     * This is a normal XdY+Z setup.
     */
	roll: (number, sided, bonus = 0) => {
		let value = 0;
		for(let i = 0; i < number; i++) {
			value += Dice.random(1, sided);
		}
		
		return value + bonus;
	},
    /**
     * This applies the @perRollBonus to each drop,
     * instead of once after all rolls have been made.
     */
	roll2: (number, sided, perRollBonus = 0) => {
		let value = 0;
		for(let i = 0; i < number; i++) {
			value += Dice.random(1, sided) + perRollBonus;
		}
		
		return value;
	},

    /**
     * 1/1000 roller with @threshold as a decimal [0.000, 1.000]
     */
    permille: (threshold = 0.500) => {
        return (Dice.random(1, 1000) / 1000) <= threshold;
    },
    /**
     * 1/100 roller with @threshold as a decimal [0.00, 1.00]
     */
    percento: (threshold = 0.50) => {
        return (Dice.random(1, 100) / 100) <= threshold;
    },
    /**
     * 50/50 chance, returning true or false
     */
	coin: () => {
		return Dice.roll(1, 2) === 1 ? true : false;
	},
    /**
     * 50/50 chance, returning 1 or 0
     */
	coin2: () => {
		return Dice.roll(1, 2) === 1 ? 1 : 0
	},

    //NOTE  Common dice configuration convenience methods
	d2: (number = 1, bonus = 0) => {
		return Dice.roll(number, 2, bonus);
	},
	d3: (number = 1, bonus = 0) => {
		return Dice.roll(number, 3, bonus);
	},
	d4: (number = 1, bonus = 0) => {
		return Dice.roll(number, 4, bonus);
	},
	d6: (number = 1, bonus = 0) => {
		return Dice.roll(number, 6, bonus);
	},
	d10: (number = 1, bonus = 0) => {
		return Dice.roll(number, 10, bonus);
	},
	d12: (number = 1, bonus = 0) => {
		return Dice.roll(number, 12, bonus);
	},
	d20: (number = 1, bonus = 0) => {
		return Dice.roll(number, 20, bonus);
	},
	d25: (number = 1, bonus = 0) => {
		return Dice.roll(number, 25, bonus);
	},
	d50: (number = 1, bonus = 0) => {
		return Dice.roll(number, 50, bonus);
	},
	d100: (number = 1, bonus = 0) => {
		return Dice.roll(number, 100, bonus);
	},

    /**
     * A weighted pool, where @weights.length === @values.length
     * e.g. weights = [ 1, 2, 1 ], values = [ "a", "b", "c" ]
     */
	weighted: (weights = [], values = []) => {
		const total = weights.reduce((a, v) => a + v, 0);
		const roll = Dice.random(1, total);
		
		let count = 0;
		for(let i = 0; i < weights.length; i++) {
			count += weights[ i ];
			
			if(roll <= count) {
				return values[ i ];
			}
		}
		
		return values[ values.length - 1 ];
	},
    /**
     * A weighted pool using pairs, instead
     * e.g. weightValuePairs = [ [ 1, "a" ], ..., [ 26, "z" ] ]
     */
	weighted2: (weightValuePairs = []) => {
		const total = weightValuePairs.reduce((a, v) => a + v[ 0 ], 0);
		const roll = Dice.random(1, total);
		
		let count = 0;
		for(let i = 0; i < weightValuePairs.length; i++) {
			count += weightValuePairs[ i ][ 0 ];
			
			if(roll <= count) {
				return weightValuePairs[ i ][ 1 ];
			}
		}
		
		return weightValuePairs[ weightValuePairs.length - 1 ][ 1 ];
	},
}

export default Dice;