//? https://www.youtube.com/watch?v=EDEUsXqPTI0

import * as PIXI from "pixi.js";

const canvas = document.getElementById("canvas");

const app = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
});

console.log(PIXI.utils.TextureCache);

// const loader = new PIXI.Loader();
const loader = PIXI.Loader.shared;
// loader.onLoad.add(onComplete);		// Per asset
loader.onComplete.add(onComplete);		// Once completed

loader.add("player", "sprite.png")
	.add("enemy", "sprite2.png")
	.on("progress", loader => console.log(loader.progress, "% loaded"))
	.on("load", (loader, resource) => console.log("Loaded", resource.name))
	.load();

let sprite;
function onComplete() {
	let texture = loader.resources[ "player" ].texture;
	sprite = new PIXI.Sprite(texture);
	sprite.anchor.set(0.5);
	app.stage.addChild(sprite);

	app.ticker.add(animate);

	/**
	 * Change the texture after 2 seconds to show a transition
	 */
	setTimeout(() => {
		sprite.texture = loader.resources[ "enemy" ].texture;
	}, 2000);
}

function animate() {
	sprite.x = app.renderer.screen.width / 2;
	sprite.y = app.renderer.screen.height / 2;
	sprite.rotation += 0.01;
};