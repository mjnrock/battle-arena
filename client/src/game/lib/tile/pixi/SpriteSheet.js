import * as PixiJS from "pixi.js";

import { Identity } from "../../Identity";

/**
 * This is the main PIXI wrapper class that will convert a TileSet
 * into a PIXI.BaseTexture and a collection of PIXI.Textures.  The
 * TileSet is kept, and the .refresh() method can be used to update
 * the PIXI data, if the TileSet changes.
 */
export class SpriteSheet extends Identity {
	constructor({ tileset, ...rest } = {}) {
		super({ ...rest });

		this.tileset = tileset;

		this.refresh();
	}

	refresh() {
		this.baseTexture = new PixiJS.BaseTexture(this.tileset.source);
		
		this.textures = new Map();
		this.tileset.tiles.forEach(tile => {
			const texture = new PixiJS.Texture(this.baseTexture, new PixiJS.Rectangle(tile.offset.x, tile.offset.y, tile.offset.width, tile.offset.height));

			this.textures.set(tile.alias, texture);
		});
	}

	get(alias) {
		return this.textures.get(alias);
	}
	toObject(type = "image/png", quality = 1.0) {
		return {
			...super.toObject(),

			...this,

			tileset: this.tileset.toObject(type, quality),
			textures: Object.fromEntries(this.textures.entries()),
		};
	}
};

export default SpriteSheet;