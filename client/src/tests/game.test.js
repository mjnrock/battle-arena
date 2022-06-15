import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
console.log(game.Environment.generators.Entities.Squirrel.create());
console.log(game.Environment.generators.Components.position.create(5, 3));	// Args go to the data.components.Position(x, y)