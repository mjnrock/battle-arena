import { useContext } from "react";

import { Context } from "./../App";

import Entity from "../lib/ecs/Entity";
import System from "../lib/ecs/System";
import Registry from "../lib/Registry";

const [ ent, ent2 ] = Entity.Factory(2, {
	cats: [
		{
			name: "cat1",
		},
		{
			name: "cat2",
		},
	],
	bob: 1,
});

// const system = new System({
// 	test: ({ entities, type, data }) => {
// 		console.log(11111, entities, type, data);
// 	},
// });

// system.invoke([ ent ], "test", Date.now());

const reg = new Registry([
	ent,
	ent2,
]);

console.log(reg);

for(let entry of reg) {
	console.log(`ENTRY:`, entry);	
}

for(let entry of ent) {
	console.log(`E:ENTRY:`, entry);	
}

export default function Home() {
    const game = useContext(Context);

    return (
        <div>
			{
				game.id
			}
		</div>
    )
}