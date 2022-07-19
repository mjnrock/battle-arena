import { useEffect, useContext } from "react";

import { Context } from "./../App";

import { PixiCanvas } from "../components/PixiCanvas";


import * as PixiJS from "pixi.js";
// import testPixiMatter from "../PixiMatterTest";
import Pixi from "../game/Pixi";

import { Entity } from "./../game/lib/ecs/Entity"

//TODO Figure out the internals of Texture, Sprite, Spritesheet, and AnimatedSprite -- start with Spritesheet and learn what parse is doing
const [ entity ] = Entity.Factory(1, {
	name: "squirrel",
	components: {
		position: {
			x: 500,
			y: 500,
		},
		sprite: new PixiJS.Sprite(PixiJS.Texture.from("assets/images/squirrel.png")),
	},
	render(dt, px) {
		const { stage, graphics } = px;
		
		this.sprite.x = this.position.x;
		this.sprite.y = this.position.y;
		this.sprite.rotation += 0.01;
	},
});
entity.sprite.anchor.set(0.5);

console.log(entity.sprite)
console.log(entity.sprite.texture)

const pixi = new Pixi({
	width: 500,
	height: 500,
	observers: [ 
		entity,
	],
});

pixi.stage.addChild(entity.sprite);

export function Default() {
	const { game } = useContext(Context);

	//* This is a debugging invocation of the renderer, and should be handled by MainLoop
	useEffect(() => {
		pixi.ticker.start();
		// const ticker = new PixiJS.Ticker();
		// console.log(ticker)
		// ticker.add(pixi.render.bind(pixi));
		// ticker.start();
		
		return () => {
			// ticker.stop();
			pixi.ticker.stop();
		};
	}, []);
	
	return (
		// <PixiCanvas app={ game.render.app } />
		<PixiCanvas view={ pixi.canvas } />
	);
};

export default Default;