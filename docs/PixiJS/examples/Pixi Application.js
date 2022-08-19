//? https://www.youtube.com/watch?v=GuY_PROTr0I

import * as PIXI from "pixi.js";

const canvas = document.getElementById("canvas");

const app = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
});

const container = new PIXI.Container();

const texture = PIXI.Texture.from("assets/images/player.png");
const sprite = new PIXI.Sprite(texture);
sprite.x = app.screen.width / 2;
sprite.y = app.screen.height / 2;
sprite.anchor.set(0.5);

container.addChild(sprite);

app.stage.addChild(container);

app.ticker.add(animate);

function animate() {
	sprite.rotation += 0.01;
};