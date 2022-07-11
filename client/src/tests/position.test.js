import Console from "../game/util/Console";
import Entity from "../game/lib/ecs/Entity";
import Position from "../game/data/components/Position";
import SystemPosition from "../game/data/systems/Position";

Console.NewContext();

// const arr = [];
// for(let i = 0; i < 10; i++) {
// 	arr.push(Position({
// 		x: 5,
// 		y: 3,
// 	}).next().value);
// }

// arr.forEach(e => console.log(e));
// console.log("\n");
// arr[ 1 ].x = 10;
// arr[ 1 ].y = 10;
// arr.forEach(e => console.log(e));

const [ ent, ent2 ] = Entity.Factory(2, {
	components: {
		position: Position({
			x: 5,
			y: 3,
		}),
	},
});

const sys = new SystemPosition();

sys.handlers.addHandler("*", () => console.log("PRE"))
sys.handlers.addHandler("**", () => console.log("POST"))

Console.label("E1", ent.position);
Console.label("E2", ent2.position);

sys.trigger([ ent ], "move", {
	x: 1,
	y: 1,
	isDelta: true,
});

Console.label("E1", ent.position);
Console.label("E2", ent2.position);

sys.trigger([ ent ], "move", {
	x: 2,
	y: 2,
	isDelta: false,
});

Console.label("E1", ent.position);
Console.label("E2", ent2.position);