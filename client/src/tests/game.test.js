import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
console.log(game.Components.aliases);
console.log(game.Systems.aliases);
// console.log(game.Systems.Map.id);

game.Systems.Map.dispatch(`collision`, [ 1, 2 ], Date.now());