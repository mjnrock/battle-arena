import Registry from "../lib/@agency/lib/Registry";
import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
// console.log(game);

//? Verify that generators are working
// console.log(game.Environment.Generators.Entities.Squirrel.create());
// console.log(game.Environment.Generators.Components.Position.create(5, 3));	// Args go to the data.components.Position(x, y)
// console.log(game.Environment.Generators.Components.Registrar.create());
console.log(game.Environment.Generators.Systems.Portal.create());

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