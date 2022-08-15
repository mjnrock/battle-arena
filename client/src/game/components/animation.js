import * as PIXI from "pixi.js";

export function animation({ sprite, track } = {}) {
	return {
		sprite: sprite || new PIXI.Sprite(),
		track,
	};
};

export default animation;