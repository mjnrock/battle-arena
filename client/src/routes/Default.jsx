import { useEffect, useRef, useContext } from "react";

import { Context } from "./../App";

// import { MouseController } from "../game/lib/input/MouseController";
// import { KeyController } from "../game/lib/input/KeyController";

export default function Home() {
	const { id, game } = useContext(Context);
	const viewport = useRef(null);

	useEffect(() => {
		viewport.current.innerHtml = "";
		viewport.current.appendChild(game.render.app.view);
	}, [ game ]);
	// const [ mouse, setMouse ] = useState(new MouseController({ element: window }));
	// const [ key, setKey ] = useState(new KeyController({ element: window }));

	// console.log(game)
	// console.log(game.realm)
	// console.log(game.realm.overworld)
	// console.log(game.realm.overworld.nodes)
	// console.log(game.realm.overworld.nodes[ "1,1" ]);
	// console.log(game.realm.overworld.entities)

	return (
		<div>
			{
				game.id
			}
			<div
				ref={ viewport }
			/>
		</div>
	)
}