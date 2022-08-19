import * as PIXI from "pixi.js";

/**
 * This should hold all of the data required for the Game to render through PIXI, as well
 * as through the sprite animation system.
 */
export function animation({ sprite, track } = {}) {
	return {
		sprite: sprite || new PIXI.Sprite(),
		track,
	};
};

export default animation;