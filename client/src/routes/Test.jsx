import { useState, useEffect, useRef } from "react";
import * as PixiJS from "pixi.js";

import { Base64 } from "../game/util/Base64";
import { Tessellator } from "./../game/lib/tile/Tessellator";
import { SpriteSheet } from "./../game/lib/tile/pixi/SpriteSheet";
import { Pixi } from "../game/Pixi";
import { Measure } from "../game/lib/tile/animate/Measure";
import { Score } from "../game/lib/tile/animate/Score";
import { Track } from "../game/lib/tile/animate/Track";
import { Entity } from "../game/lib/ecs/Entity";

import { PixiCanvas } from "../components/PixiCanvas";

//* Create the Pixi Rendering Engine
const pixi = new Pixi({
	width: 500,
	height: 500,
});

export function Test() {
	const [ source, setSource ] = useState();

	useEffect(() => {
		Base64.FileDecode("assets/images/squirrel.png").then(canvas => setSource(canvas));
	}, []);

	useEffect(() => {
		if(source) {
			const tessellator = Tessellator.FromCanvas({
				alias: "squirrel",
				canvas: source,
				algorithm: Tessellator.Algorithms.GridBased,
				args: [ { tw: 32, th: 32 } ],
			});

			const spritesheet = new SpriteSheet({
				tileset: tessellator.tileset,
			});

			const score = Score.FromArray([
				[ "squirrel.normal.north.0", "squirrel.normal.north.1" ],
				[ "squirrel.normal.east.0", "squirrel.normal.east.1" ],
				[ "squirrel.normal.south.0", "squirrel.normal.south.1" ],
				[ "squirrel.normal.west.0", "squirrel.normal.west.1" ],
			]);
			
			score.timer.parseListeners({
				next: [
					({ id, current, elapsed }) => {
						console.log("next", id, current, elapsed);
					},
				],
			});

			const track = Track.Create({
				score,
				spritesheet,
			});

			//* Create a bunch of entities
			const entities = Entity.Factory(100, {
				name: "squirrel",
				components: {
					position: () => ({
						x: ~~(Math.random() * window.innerWidth),
						y: ~~(Math.random() * window.innerHeight),
						theta: 0,
					}),
					sprite: () => ({
						sprite: new PixiJS.Sprite(track.current),
						track,
					}),
				},

				render(dt, px) {
					const { stage, graphics } = px;
					const sprite = this.sprite.sprite;

					sprite.texture = this.sprite.track.current;
					sprite.x = this.position.x;
					sprite.y = this.position.y;
					// sprite.rotation += Math.random() > 0.5 ? 0.01 : 0.03;
				},

				each(entity, i) {
					entity.sprite.sprite.anchor.set(0.5);
				},
			});


			//* Add the Entity to the PIXI stage
			for(let entity of entities) {
				pixi.observers.add(entity);
				pixi.stage.addChild(entity.sprite.sprite);
			}

			//* Create a small game loop
			setInterval(() => {
				const ts = Date.now();
				for(let entity of entities) {
					entity.sprite.track.next(ts);
				}
			}, 1000 / 10);
		}
	}, [ source ]);

	useEffect(() => {
		pixi.ticker.start();

		return () => {
			pixi.ticker.stop();
		};
	}, []);

	return (
		<PixiCanvas view={ pixi.canvas } />
	);
};

export default Test;