import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
console.log(game);

//? Verify that generators are working
// console.log(game.Environment.Generators.Entities.Squirrel.create());
// console.log(game.Environment.Generators.Components.Position.create(5, 3));	// Args go to the data.components.Position(x, y)
// console.log(game.Environment.Generators.Components.Registrar.create());
//* console.log(game.Environment.Generators.Systems.XXXXXXX.create());