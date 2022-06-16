import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
// console.log(game);

//? Verify that generators are working
console.log(game.Environment.Generators.Entities.Squirrel.regenerateMany(3, {
	Position: {
		x: 5.12312,
		y: 35.5,
	},
}));
console.log(game.Environment.Generators.Entities.Squirrel.regenerate({
	Position: {
		x: 5.12312,
		y: 35.5,
	},
}));
// console.log(game.Environment.Generators.Entities.Squirrel.create().__entries);
// console.log(game.Environment.Generators.Components.Position.create({ x: 5, y: 3 }));	// Args go to the data.components.Position(x, y)
// console.log(game.Environment.Generators.Systems.Portal.create());

//? Verify that the tagging and pool results are working
// const ent = game.Environment.Generators.Entities.Squirrel.create();
// const ent2 = game.Environment.Generators.Entities.Squirrel.create();
// ent.tags.add("squirrel");
// ent2.tags.add("squirrel");
// ent.tags.add("moo");
// const registry = new Registry([ ent, ent2 ], {
// 	classifiers: [
// 		Registry.Classifiers.Tagging(),
// 	],
// });
// console.log(registry.getPool("#squirrel", true));

