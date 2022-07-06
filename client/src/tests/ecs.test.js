import Entity from "../game/lib/ecs/entity";
import System from "../game/lib/ecs/System";
import Registry from "../game/lib/Registry";

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

system.invoke(reg, "test", Date.now());

// console.log(ent.kasheeka)
// ent.update("kasheeka", {a:123}, true);
// console.log(ent.kasheeka)

for(let [ id, ent ] of reg) {
	console.log(ent.bob);
}