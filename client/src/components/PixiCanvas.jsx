import React, { useEffect, useRef } from "react";

export function PixiCanvas({ app } = {}) {
	const canvasRef = useRef();

	useEffect(() => {
		const ref = canvasRef.current;

		ref.appendChild(app.view);

		return () => {
			ref.removeChild(app.view);
		}
	}, []);

	return (
		<div ref={ canvasRef } />
	);
}

export default PixiCanvas;



// PIXI.Loader.shared 		// Loader instance shared across all loaders
// const loader = new PIXI.Loader()
// 	.add("bunny", "./assets/images/bunny.png")
// 	.load(setup);

// console.log(loader.resources)

// function setup(loader, resources) {
// 	// This creates a texture from a "bunny.png" image.
// 	const bunny = new PIXI.Sprite(resources.bunny.texture);

// 	// Setup the position of the bunny
// 	bunny.x = app.renderer.width / 2;
// 	bunny.y = app.renderer.height / 2;

// 	// Rotate around the center
// 	bunny.anchor.x = 0.5;
// 	bunny.anchor.y = 0.5;

// 	// Add the bunny to the scene we are building.
// 	app.stage.addChild(bunny);

// 	// Listen for frame updates
// 	app.ticker.add(() => {
// 		// each frame we spin the bunny around a bit
// 		bunny.rotation += 0.01;
// 	});
// }