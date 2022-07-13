//? https://www.youtube.com/watch?v=2J0VUiozAVM

import * as PIXI from "pixi.js";

const canvas = document.getElementById("canvas");

const renderer = new PIXI.Renderer({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
});

window.addEventListener("resize", resize);

function resize() {
	const { innerWidth: width, innerHeight: height } = window;
	
	renderer.resize(width, height);
}

const stage = new PIXI.Container();

const texture = PIXI.Texture.from("assets/images/player.png");
const sprite = new PIXI.Sprite(texture);

sprite.anchor.set(0.5);
stage.addChild(sprite);

const ticker = new PIXI.Ticker();
ticker.add(animate);
ticker.start();

function animate() {
	sprite.x = renderer.screen.width / 2;
	sprite.y = renderer.screen.height / 2;
	sprite.rotation += 0.01;

	renderer.render(stage);
};