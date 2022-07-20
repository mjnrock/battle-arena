import Base64 from "../../util/Base64";

/**
 * TODO: Create a Frame and FrameSet equivalent for Tile and TileSet, respectively.  Use the TileSet data to generate a PIXI.BaseTexture from the source image, and multiple PIXI.Textures from the Tile data.
 * TODO: Tesselate the Base64.FileDecode into a TileSet/Tiles
 */

export class Tessellator {
	static Algorithms = {};

	constructor ({ alias, source } = {}) {
		this.alias = alias;
		this.source = source;
	}

	async tessellate() {
		const { alias, source } = this;

		console.log(alias, source);
	}

	static async FetchFile(url, alias) {
		const canvas = await Base64.FileDecode(url);

		return new Tessellator({ alias, source: canvas });
	}
};

export default Tessellator;