//? https://www.youtube.com/watch?v=2J0VUiozAVM

import * as PixiJS from "pixi.js";
import MatterJS from "matter-js";
import { clamp } from "./game/util/helper";

const renderer = new PixiJS.Renderer({
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

const stage = new PixiJS.Container();

const ticker = new PixiJS.Ticker();
ticker.add(animate);
ticker.start();

const sprites = [];
function addSprite() {
	const texture = PixiJS.Texture.from("assets/images/squirrel.png");
	const sprite = new PixiJS.Sprite(texture);
	
	sprite.x = clamp((Math.random() > 0.5 ? 1 : -1) * Math.random() * renderer.screen.width, 0, renderer.screen.width);
	sprite.y = clamp((Math.random() > 0.5 ? 1 : -1) * Math.random() * renderer.screen.height, 0, renderer.screen.height);
	sprite.anchor.set(0.5);
	stage.addChild(sprite);

	sprites.push(sprite);
};

for(let i = 0; i < 1000; i++) {
	addSprite();
}

function animate() {
	sprites.forEach(sprite => {
		sprite.rotation += 0.01;
	});

	renderer.render(stage);
};

export default {
	renderer,
};