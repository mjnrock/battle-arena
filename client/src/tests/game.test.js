import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
// console.log(game.Systems);

// console.log(game.Systems.Node.test());

game.Systems.Map.dispatch(`collision`, [ 1, 2 ], Date.now());