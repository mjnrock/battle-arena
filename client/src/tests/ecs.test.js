import Console from "./../game/util/Console";
import Entity from "../game/lib/ecs/Entity";
import System from "../game/lib/ecs/System";
import Manager from "../game/lib/ecs/Manager";
import Registry from "../game/util/Registry";

Console.NewContext();

const [ ent, ent2 ] = Entity.Factory(2, {
	$eval: true,

	cats: [
		{
			name: "cat1",
		},
		{
			name: "cat2",
		},
	],
	kasheeka: {
		meows: true,
	},
	bob: () => Math.random(),
}, {
	tags: [ "cat" ],
});

const reg = new Registry({
	p1: ent,
	p2: ent2,
});

const system = new System({
	test: ({ entities, type, data }) => {
		console.log(11111, entities.map(e => e.id), type, data);
	},
});

system.trigger(reg, "test", Date.now());

const mgr = new Manager({
	p1: ent,
	p2: ent2,
}, {
	test: ({ entities, type, data } = {}) => {
		console.log(22222, entities.map(e => e.id), type, data);
	},
});

mgr.trigger("test", Date.now());

console.log(mgr.entities)
// console.log(mgr.entities[ "#cat" ])

// console.log(ent.kasheeka)
// ent.update("kasheeka", {a:123}, true);
// console.log(ent.kasheeka)

// for(let [ id, ent ] of reg) {
// 	console.log(ent.bob);
// }

// const id = ent.register(51)
// console.log(789, id)
// console.log(789, ent[ id ])