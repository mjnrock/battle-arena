import { useEffect, useContext } from "react";
import Base64 from "./../game/util/Base64";

import { Context } from "./../App";
import { PixiCanvas } from "../components/PixiCanvas";


import * as PixiJS from "pixi.js";
// import testPixiMatter from "../PixiMatterTest";
import Pixi from "../game/lib/pixi/Pixi";

import { Entity } from "./../game/lib/ecs/Entity";

//* Instance of the PixiJS wrapper engine
Base64.DecodeFile("assets/images/squirrel.png").then(canvas => {
	// const data = canvas.toDataURL();
	//TODO Create a tesselation system to parse the image
});


//TODO From BaseTextures, create per-frame Textures, and render to screen in a Sprite
//TODO Create Sprite wrapper for PixiJS.Sprite, SpriteSheet extends Sprite, Animator, Tessellator
//* Load a collection of assets into base textures, to be used in spritesheet animations
const bt = PixiJS.BaseTexture.from("assets/images/squirrel.png");
//? Create a per-frame Texture from the BaseTexture, offset by the frame's relative position
const t0 = new PixiJS.Texture(bt, new PixiJS.Rectangle(0, 0, 32, 32));
const t1 = new PixiJS.Texture(bt, new PixiJS.Rectangle(0, 32, 32, 32));
const t2 = new PixiJS.Texture(bt, new PixiJS.Rectangle(0, 64, 32, 32));
const t3 = new PixiJS.Texture(bt, new PixiJS.Rectangle(0, 96, 32, 32));
//TODO Ultimately use the Sprite wrapper class to render the sprites as an Entity component, as well as an internal .render method to invoke each draw call


//* Create the rendering engine and default layer
const pixi = new Pixi({
	width: 500,
	height: 500,
});


//* Create a bunch of entities
const entities = Entity.Factory(10, {
	name: "squirrel",
	components: {
		position: () => ({
			x: ~~(Math.random() * window.innerWidth),
			y: ~~(Math.random() * window.innerHeight),
			theta: 0,
		}),
		sprite: () => ({
			texture: t0,
			sprite: new PixiJS.Sprite(t0),
		}),
	},

	render(dt, px) {
		const { stage, graphics } = px;
		const sprite = this.sprite.sprite;

		sprite.x = this.position.x;
		sprite.y = this.position.y;
		sprite.rotation += Math.random() > 0.5 ? 0.01 : 0.03;
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


//* Randomly change the textures of each entity
//TODO Make a namespace-texture tree for assets
setInterval(() => {
	for(let entity of entities) {
		let nextTexture;
		if(Math.random() > 0.5) {
			nextTexture = t1;
		} else {
			nextTexture = t0;
		}

		entity.update("sprite", { texture: nextTexture }, true);
		entity.sprite.sprite.texture = nextTexture;
	}
}, 500);

export function Default() {
	const { game } = useContext(Context);

	//* This is a debugging invocation of the renderer, and should be handled by MainLoop
	useEffect(() => {
		pixi.ticker.start();

		return () => {
			pixi.ticker.stop();
		};
	}, []);

	return (
		// <PixiCanvas app={ game.render.app } />
		<PixiCanvas view={ pixi.canvas } />
	);
};

export default Default;