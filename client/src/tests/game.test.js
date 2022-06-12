import Console from "../lib/@agency/util/Console";
import Map from "../lib/realm/Map";
import Node from "../lib/realm/Node";

import Game from "./../lib/Game";

Console.NewContext();

const game = new Game();
// console.log(game);

// console.log(game.Realm);
// console.log(game.Realm.entities.registry);
// console.log(game.Factory);
// console.log(game.Systems.aliases);
// console.log(game.Systems.Map.create());
// console.log(game.Systems.Map.id);

// game.Systems.Map.dispatch(`collision`, [ 1, 2 ], Date.now());

// const comp = game.Factory.Components.position.create(0, 0);
// console.log(comp);

const overworld = game.Realm.Maps.overworld;
console.log(overworld)

const player = game.Realm.entities.registry.player;
// console.log(player)
// console.log(player.position)
console.log(player.children)