import { useState, useEffect, useRef } from "react";

import { Base64 } from "../game/util/Base64";
import { Tessellator } from "./../game/lib/tile/Tessellator";

export function Test() {
	const canvasRef = useRef(null);
	const [ source, setSource ] = useState();

	useEffect(() => {
		Base64.FileDecode("assets/images/squirrel.png").then(canvas => setSource(canvas));
	}, []);

	useEffect(() => {
		if(source) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");

			canvas.width = 1000;
			canvas.height = 800;

			const tessellator = Tessellator.FromCanvas({
				alias: "squirrel",
				canvas: source,
				algorithm: Tessellator.Algorithms.GridBased,
				args: [ { tw: 32, th: 32 } ],
			});

			for(let [ uuid, tile ] of tessellator.tileset) {
				if(Math.random() < 0.5) {
					ctx.drawImage(
						tile.canvas,

						tile.boundary.x,
						tile.boundary.y,
						tile.boundary.width,
						tile.boundary.height
					);
				}
			}

			console.log(tessellator.tileset.tiles[ "squirrel.normal.north.0" ]);
			console.log(tessellator.tileset.tiles[ "squirrel.normal.south.1" ]);
		}
	}, [ source ]);

	return (
		<div>
			<canvas ref={ canvasRef } style={ {
				border: "1px solid black",
				margin: 10,
			} } />
		</div>
	);
};

export default Test;