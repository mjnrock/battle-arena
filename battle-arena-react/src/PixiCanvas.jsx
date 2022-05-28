/* eslint-disable */
import React, { Fragment, useEffect, useRef } from "react";

import * as PIXI from "pixi.js";

// TODO: Convert this into a resuable wrapper for any 3js renderer
export function ThreeCanvas() {
	const canvasRef = useRef();

	useEffect(() => {
		const app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			antialias: true,
			transparent: false,
			resolution: 1
		});
		canvasRef.current.appendChild(app.view);
		
		// PIXI.Loader.shared 		// Loader instance shared across all loaders
		const loader = new PIXI.Loader()
			.add("bunny", "./assets/images/bunny.png")
			.load(setup);

		console.log(loader.resources)

		function setup(loader, resources) {
			// This creates a texture from a "bunny.png" image.
			const bunny = new PIXI.Sprite(resources.bunny.texture);

			// Setup the position of the bunny
			bunny.x = app.renderer.width / 2;
			bunny.y = app.renderer.height / 2;

			// Rotate around the center
			bunny.anchor.x = 0.5;
			bunny.anchor.y = 0.5;

			// Add the bunny to the scene we are building.
			app.stage.addChild(bunny);

			// Listen for frame updates
			app.ticker.add(() => {
				// each frame we spin the bunny around a bit
				bunny.rotation += 0.01;
			});
		}

		return () => {
			canvasRef.current.removeChild(app.view);
		}
	}, []);

	return (
		<div
			ref={ canvasRef }
		/>
	);
}

export default ThreeCanvas;