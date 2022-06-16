import Entity from "../lib/@agency/lib/ecs/Entity";
import Console from "../lib/@agency/util/Console";

import Game from "./../lib/Game";
import Realm from "./../lib/realm/Realm";

Console.NewContext();

const game = new Game();
// console.log(game);

//? Verify that generators are working
// console.log(game.Environment.Generators.Entities.Squirrel.regenerateMany(3, {
// 	Position: {
// 		x: 5.12312,
// 		y: 35.5,
// 	},
// }));
// console.log(game.Environment.Generators.Entities.Squirrel.regenerate({
// 	Position: {
// 		x: 5.12312,
// 		y: 35.5,
// 	},
// }).Position);
// console.log(game.Environment.Generators.Entities.Squirrel.regenerate());
// console.log(game.Environment.Generators.Components.Position.regenerate({ x: 5, y: 3 }));	// Args go to the data.components.Position(x, y)
// console.log(game.Environment.Generators.Systems.Portal.regenerate());

//? Verify that the tagging and pool results are working
// const ent = game.Environment.Generators.Entities.Squirrel.regenerate();
// const ent2 = game.Environment.Generators.Entities.Squirrel.regenerate();
// ent.tags.add("squirrel");
// ent2.tags.add("squirrel");
// ent.tags.add("moo");
// const registry = new Registry([ ent, ent2 ], {
// 	classifiers: [
// 		Registry.Classifiers.Tagging(),
// 	],
// });
// console.log(registry.getPool("#squirrel", true));

//? Verify that the Realm space is working
const realm = new Realm();
// console.log(realm);
// console.log(realm.maps);
// console.log(realm.maps.registry.__entries);
realm.maps.addWithAlias({
	overworld: new Entity(),
});
// console.log(realm.maps.registry.__entries);
console.log(realm.maps.overworld);