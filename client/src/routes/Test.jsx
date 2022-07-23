import { useState, useEffect, useRef } from "react";

import { Base64 } from "../game/util/Base64";
import { Tessellator } from "./../game/lib/tile/Tessellator";
import { SpriteSheet } from "./../game/lib/tile/pixi/SpriteSheet";
import Timer from "../game/lib/tile/animate/Timer";
import Measure from "../game/lib/tile/animate/Measure";
import Score from "../game/lib/tile/animate/Score";

export function Test() {
	const canvasRef = useRef(null);
	const [ source, setSource ] = useState();
	// const timer = new Timer({
	// 	cadence: [ 100, 100, 1250, 2000 ],
	// 	listeners: {
	// 		next: [
	// 			({ id, current, elapsed }) => console.log("next", id, current, elapsed),
	// 		],
	// 		loop: [
	// 			({ id, current, elapsed }) => console.log("loop", id, current, elapsed),
	// 		],
	// 	},
	// });

	useEffect(() => {
		Base64.FileDecode("assets/images/squirrel.png").then(canvas => setSource(canvas));

		// timer.start();
		// console.log(timer)

		// return () => {
		// 	timer.stop();
		// };
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

			const spriteSheet = new SpriteSheet({
				tileset: tessellator.tileset,
			});

			const measure = Measure.CreateEqual(
				"squirrel.normal.north.0",
				"squirrel.normal.north.1"
			);
			const score = new Score({
				measures: [ measure ],
			});
			score.timer.parseListeners({
				next: [
					({ id, current, elapsed }) => {
						// spriteImageIndex = current;
						console.log("next", id, current, elapsed);
					},
				],
			});
			score.timer.start();

			console.log(score.timer)

			/**
			 ** HEY READ THIS
			 *? HEY READ THIS
			 * TODO Next steps for testing are to bounce the Score into a Track and test on the PIXI renderer
			 */

			for(let [ uuid, tile ] of tessellator.tileset) {
				if(Math.random() < 0.5) {
					ctx.drawImage(
						tile.canvas,

						tile.offset.x,
						tile.offset.y,
						tile.offset.width,
						tile.offset.height
					);
				} else {
					ctx.strokeStyle = "red";
					ctx.beginPath();
					ctx.rect(
						tile.offset.x,
						tile.offset.y,
						tile.offset.width,
						tile.offset.height
					);
					ctx.stroke();
				}
			}

			console.log(tessellator.tileset.tiles[ "squirrel.normal.north.0" ]);
			console.log(tessellator.tileset.tiles[ "squirrel.normal.south.1" ]);

			console.log(spriteSheet.get("squirrel.normal.north.0"));
			console.log(spriteSheet.get("squirrel.normal.south.1"));
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