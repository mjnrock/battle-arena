import { Base64 } from "../../util/Base64";
import { Identity } from "../../util/Identity";
import { Registry } from "./../../util/Registry";
import { Tile } from "./Tile";

/**
 * A TileSet is both a Tile itself, and a Registry of child Tiles.  Each Tile
 * in the registry is a stadalone representation of that tile, but also
 * contains the metadata relative to this.source.
 * 
 * Tiles can be added directly, or they can be created from the source image by
 * pasing either x,y or tx,ty coordinates, ultimately resolving to pixel coordinates.
 * 
 * NOTE: See Tile note.
 */
export class TileSet extends Tile {
	constructor ({ source, tiles, tw, th, ...rest } = {}) {
		super({
			x: 0,
			y: 0,
			width: source.width,
			height: source.height,
			source,

			...rest,
		});

		this.tiles = new Registry(tiles);

		this.config = {
			tw,
			th,
		};
	}

	[ Symbol.iterator ]() {
		return this.tiles[ Symbol.iterator ]();
	}

	addTileData({ alias, tx, ty, x, y, ...rest } = {}) {
		if(typeof tx === "number" && typeof ty === "number") {
			x = tx * this.config.tw;
			y = ty * this.config.th;
		} else {
			tx = ~~(x / this.config.tw);
			ty = ~~(y / this.config.th);
		}

		alias = [ alias, `${ tx },${ ty }` ];

		const tile = new Tile({
			alias,
			x,
			y,
			width: this.config.tw,
			height: this.config.th,
			source: this.tile,
			...rest,
		});

		this.tiles.registerWithAlias(tile, alias);

		return tile;
	}
	addManyTileData(addTileDataObjs = []) {
		addTileDataObjs.forEach(argObj => {
			this.addTileData(argObj);
		});

		return this;
	}
	addTile(tile, alias) {
		this.tiles.registerWithAlias(tile, alias);

		return this;
	}
	addManyTiles(input) {
		if(Identity.Comparators.IsStrictObject(input)) {
			/**
			 * A { [ alias ]: tile, ... } object
			 */
			for(let [ alias, tile ] of Object.entries(input)) {
				this.addTile(tile, alias);
			}
		} else if(Identity.Comparators.IsArray(input)) {
			/**
			 * A [ tile, ... ] array
			 */
			input.forEach(tileEntry => {
				this.addTile(tileEntry);
			});
		}

		return this;
	}

	//FIXME: Verify this works
	toObject(type = "image/png", quality = 1.0) {
		return {
			...super.toObject(),

			...this,

			tiles: this.tiles.toObject(),
		};
	}

	async FetchFile(url, { ...opts } = {}) {
		const canvas = await Base64.DecodeFile(url);
		const tileSet = new TileSet({ source: canvas, ...opts });

		return tileSet;
	}
};

export default TileSet;