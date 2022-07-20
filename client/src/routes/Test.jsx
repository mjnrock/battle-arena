import { useState, useEffect, useRef } from "react";
import { Base64 } from "../game/util/Base64";

import { Tessellator } from "./../game/lib/tile/Tessellator";
import { Tile } from "./../game/lib/tile/Tile";

export function Test() {
	const canvasRef = useRef(null);
	const [ source, setSource ] = useState();
	const [ tiles, setTiles ] = useState([]);

	useEffect(() => {
		Base64.FileDecode("assets/images/squirrel.png").then(canvas => setSource(canvas));
	}, []);

	useEffect(() => {
		if(source) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");

			// canvas.width = source.width;
			// canvas.height = source.height;

			
			const [ tile1 ] = [
				new Tile({
					x: 32,
					y: 32,
					width: 32,
					height: 32,
					source: source,
					// source: ctx.getImageData(0, 0, 32, 32)
				}),
			];

			canvas.width = tile1.boundary.width;
			canvas.height = tile1.boundary.height;
			ctx.drawImage(tile1.canvas, 0, 0);

			console.log(tile1.canvas.toDataURL());

			setTiles([
				tile1,
			]);
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