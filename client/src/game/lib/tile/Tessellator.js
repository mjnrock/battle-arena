import { Base64 } from "../../util/Base64";
import { TileSet } from "./TileSet";

/**
 * TODO: Create a Frame and FrameSet equivalent for Tile and TileSet, respectively.  Use the TileSet data to generate a PIXI.BaseTexture from the source image, and multiple PIXI.Textures from the Tile data.
 * TODO: Tesselate the Base64.FileDecode into a TileSet/Tiles
 * 
 * NOTE: The Tesselator, Tile, and TileSet classes are DATA OBJECT classes.
 * Use the PIXI-based wrappers to leverage the underlying data.
 */

/**
 * The Tessellator takes a source image and tessellates that image based on the
 * algorithm used.  The algorithm is expected to return a TileSet.  Some default
 * algorithms are provided, but it is possible to create your own.
 * 
 * NOTE: See Tile note.
 */
export class Tessellator {
	static Algorithms = {
		GridBased: (source, { tw, th } = {}) => {
			const tileset = new TileSet({ source });

			//TODO - Implement grid-based tessellation.

			return tileset;
		},
	};

	constructor ({ alias, source } = {}) {
		this.alias = alias;
		this.source = source;

		this.tileset = null;
	}

	async tessellate(algorithm, ...args) {
		const tileset = await algorithm(this.source, ...args);

		this.tileset = tileset;

		return this;
	}

	static async FetchFile(url, alias) {
		const canvas = await Base64.FileDecode(url);

		return new Tessellator({ alias, source: canvas });
	}
};

export default Tessellator;