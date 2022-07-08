import Console from "../game/util/Console";
import Squirrel from "./../game/data/entities/Squirrel";

Console.NewContext();

const [ skwrl, skwrl2 ] = Squirrel.Factory(2, {
	args: {
		position: () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
		}),
	},
});

// console.log(skwrl);
console.log(skwrl.position);
// console.log(skwrl2);
console.log(skwrl2.position);