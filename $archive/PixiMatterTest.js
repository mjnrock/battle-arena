//? https://www.youtube.com/watch?v=2J0VUiozAVM

import * as PixiJS from "pixi.js";
import MatterJS from "matter-js";
import Entity from "../client/src/game/lib/ecs/Entity";

const entities = Entity.Factory(2, {
	name: "squirrel",
	components: {
		model: () => MatterJS.Bodies.circle(
			100 + Math.random() * 250,
			100 + Math.random() * 250,
			30,
		),
		sprite: null,
	},
});
const [ e1, e2 ] = entities;

for(let e of entities) {
	e.model.mass = 1;
	e.model.velocity.x = 0;
	e.model.velocity.y = 0;
	console.log(e.model);
}


function initMatter() {
	const engine = MatterJS.Engine.create();

	engine.gravity.x = 0;
	engine.gravity.y = 0;

	MatterJS.World.add(engine.world, entities.map(e => e.model));

	// an example of using collisionStart event on an engine
	MatterJS.Events.on(engine, "collisionStart", function (event) {
		var pairs = event.pairs;

		// change object colours to show those starting a collision
		for(var i = 0; i < pairs.length; i++) {
			const { bodyA: ent1, bodyB: ent2 } = pairs[i];
		}

		console.log(pairs);
	});

	// an example of using collisionActive event on an engine
	MatterJS.Events.on(engine, "collisionActive", function (event) {
		var pairs = event.pairs;

		// change object colours to show those in an active collision (e.g. resting contact)
		for(var i = 0; i < pairs.length; i++) {
			const { bodyA: ent1, bodyB: ent2 } = pairs[i];
		}

		console.log(pairs);
	});

	// an example of using collisionEnd event on an engine
	MatterJS.Events.on(engine, "collisionEnd", function (event) {
		var pairs = event.pairs;

		// change object colours to show those ending a collision
		for(var i = 0; i < pairs.length; i++) {
			const { bodyA: ent1, bodyB: ent2 } = pairs[i];
		}

		console.log(...pairs);
	});

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

	const ticker = new PixiJS.Ticker();
	ticker.add(animate);
	ticker.start();

	const stage = new PixiJS.Container();
	const texture = PixiJS.Texture.from("assets/images/squirrel.png");

	for(let entity of entities) {		
		const sprite = new PixiJS.Sprite(texture);

		sprite.x = entity.model.position.x;
		sprite.y = entity.model.position.y;
		sprite.anchor.set(0.5);
		
		entity.sprite = sprite;

		stage.addChild(entity.sprite);		
	}

	const graphics = new PixiJS.Graphics();
	stage.addChild(graphics);

	//FIXME Some properties need to be adjusted, as collisions generate a shit-ton of velocity
	renderer.view.onclick = function(e) {
		const { x, y } = e;

		for(let entity of entities) {
			entity.model.position.x = x + Math.random() * 100;
			entity.model.position.y = y + Math.random() * 100;
		}

		//? This works without the engine, but is not efficient.
		// console.log(MatterJS.Collision.collides(entity.model, entity2.model));
	};

	function animate() {
		graphics.clear();

		for(let entity of entities) {
			entity.sprite.x = entity.model.position.x;
			entity.sprite.y = entity.model.position.y;
			graphics.beginFill(0xFF0000);
			graphics.drawCircle(entity.model.position.x, entity.model.position.y, entity.model.circleRadius);
			graphics.endFill();
		}

		renderer.render(stage);
	};

	return renderer;
};

const engine = initMatter();
const renderer = initPixi();

setInterval(() => {		
	//? You may be able to get away with this, but try and find a better way.
	for(let entity of entities) {
		MatterJS.Body.setVelocity(entity.model, MatterJS.Vector.create(0, 0));
	}

	MatterJS.Engine.update(engine, 100);
}, 100);

export default {
	engine,
	renderer,
};