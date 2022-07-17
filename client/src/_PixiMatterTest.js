//? https://www.youtube.com/watch?v=2J0VUiozAVM

import * as PixiJS from "pixi.js";
import MatterJS from "matter-js";
import { clamp } from "./game/util/helper";
import Entity from "./game/lib/ecs/Entity";
import Position from "./game/data/components/Position";

const entity = new Entity({
	name: "squirrel",
	components: {
		position: Position({
			x: 0,
			y: 0,
		}),
		model: MatterJS.Bodies.circle(x, y, 20),
		sprite: null,
	},
});

function initMatter() {
	const engine = MatterJS.Engine.create();

	MatterJS.World.add(engine.world, [ entity.model ]);
	// MatterJS.Composite.add(engine.world, [
    //     // walls
    //     MatterJS.Bodies.rectangle(0, 0, window.innerWidth, 1, { isStatic: true }),
    //     MatterJS.Bodies.rectangle(0, 0, 1, window.innerHeight, { isStatic: true }),
    //     MatterJS.Bodies.rectangle(window.innerWidth, 0, 1, window.innerHeight, { isStatic: true }),
    //     MatterJS.Bodies.rectangle(0, window.innerHeight, window.innerWidth, 1, { isStatic: true }),
    //     stack,
    // ]);

	return engine;
};

function initPixi() {
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

	return renderer;
};

const engine = initMatter();
const renderer = initPixi();

setInterval(() => {
	entity.position.x = Math.random() * renderer.screen.width;
	entity.position.y = Math.random() * renderer.screen.height;

	entity.model.position.x = entity.position.x;
	entity.model.position.y = entity.position.y;
	
	MatterJS.Engine.update(engine, 100);
}, 100);

console.log(engine)

export default {
	engine,
	renderer,
};