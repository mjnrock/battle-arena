import { useState, useEffect, useRef } from "react";
import * as PixiJS from "pixi.js";

import { Base64 } from "../game/util/Base64";
import { Tessellator } from "./../game/lib/tile/Tessellator";
import { SpriteSheet } from "./../game/lib/tile/pixi/SpriteSheet";
import { Pixi } from "../game/Pixi";
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
	const [ squirrelSource, setSquirrelSource ] = useState();
	const [ bunnySource, setBunnySource ] = useState();

	useEffect(() => {
		Base64.FileDecode("assets/images/squirrel.png").then(canvas => setSquirrelSource(canvas));
		Base64.FileDecode("assets/images/bunny.png").then(canvas => setBunnySource(canvas));
		Base64.FilesDecode([
			"assets/images/squirrel.png",
			"assets/images/bunny.png",
			"assets/images/bear.png",
		]).then(data => {
		// Base64.FilesDecode({
		// 	squirrel: "assets/images/squirrel.png",
		// 	bunny: "assets/images/bunny.png",
		// 	bear: "assets/images/bear.png",
		// }).then(data => {
			console.log(data);
		});
	}, []);

	/**
	 * Steps:
	 * 1) Decode Files into Canvases
	 * 2) Tessellate each Canvas, using some pre-configured settings
	 * 3) Create SpriteSheets from each tessellation TileSet
	 * 4) Define each animation Score
	 * 5) Process each Score into Tracks
	 */

	useEffect(() => {
		if(squirrelSource) {
			const tessellator = Tessellator.FromCanvas({
				alias: "squirrel",
				canvas: squirrelSource,
				algorithm: Tessellator.Algorithms.GridBased,
				args: [ { tw: 32, th: 32 } ],
			});

			const spritesheet = new SpriteSheet({
				tileset: tessellator.tileset,
			});

			//FIXME: These nested .toObjects do not work properly -- figure out which work and fix the others
			// console.log(spritesheet.toObject());

			const squirrelScore = Score.FromArray([
				[ "squirrel.normal.north.0", "squirrel.normal.north.1" ],
				[ "squirrel.normal.east.0", "squirrel.normal.east.1" ],
				[ "squirrel.normal.south.0", "squirrel.normal.south.1" ],
				[ "squirrel.normal.west.0", "squirrel.normal.west.1" ],
			]);

			const track = Track.Create({
				score: squirrelScore,
				spritesheet,
				autoPlay: true,
			});

			// track.timer.parseListeners({
			// 	next: [
			// 		({ id, current, elapsed }) => {
			// 			console.log("next", id, current, elapsed);
			// 		},
			// 	],
			// });

			//* Create a bunch of entities
			const entities = Entity.Factory(1000, {
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
	}, [ squirrelSource ]);
	useEffect(() => {
		if(bunnySource) {
			const tessellator = Tessellator.FromCanvas({
				alias: "bunny",
				canvas: bunnySource,
				algorithm: Tessellator.Algorithms.GridBased,
				args: [ { tw: 32, th: 32 } ],
			});

			const spritesheet = new SpriteSheet({
				tileset: tessellator.tileset,
			});

			const bunnyScore = Score.FromArray([
				[ "bunny.normal.north.0", "bunny.normal.north.1" ],
				[ "bunny.normal.east.0", "bunny.normal.east.1" ],
				[ "bunny.normal.south.0", "bunny.normal.south.1" ],
				[ "bunny.normal.west.0", "bunny.normal.west.1" ],
			]);

			const track = Track.Create({
				score: bunnyScore,
				spritesheet,
				autoPlay: false,
			});

			// track.timer.parseListeners({
			// 	next: [
			// 		({ id, current, elapsed }) => {
			// 			console.log("next", id, current, elapsed);
			// 		},
			// 	],
			// });

			//* Create a bunch of entities
			const entities = Entity.Factory(1000, {
				name: "bunny",
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
	}, [ bunnySource ]);

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