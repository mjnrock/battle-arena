import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
console.log(game);

// console.log(game.Systems);
// console.log(game.Factory);
// console.log(game.Systems.aliases);
// console.log(game.Systems.Map.create());
// console.log(game.Systems.Map.id);

// game.Systems.Map.dispatch(`collision`, [ 1, 2 ], Date.now());

const comp = game.Factory.Components.position.create(0, 0);
console.log(comp);