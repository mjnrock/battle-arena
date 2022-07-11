import { useContext } from "react";

import { Context } from "./../App";

export default function Home() {
	const { game } = useContext(Context);

	console.log(game)
	console.log(game.realm)
	console.log(game.realm.overworld)
	console.log(game.realm.overworld.nodes)
	console.log(game.realm.overworld.nodes[ "2,3" ]);

	return (
		<div>
			{
				game.id
			}
		</div>
	)
}