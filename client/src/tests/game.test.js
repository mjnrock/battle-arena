import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";

import MapSystem from "./../data/systems/MapSystem";

Console.NewContext();

const game = new Game();
const sysMap = new MapSystem();

// console.log(game);
// console.log(system);

game.Systems.registerWithAlias(sysMap, "Map");

// console.log(game.systems);
// Console.hr();
// console.log(game);

game.Systems.Map.dispatch(`collision`, [ 1, 2 ], Date.now());