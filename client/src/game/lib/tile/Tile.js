import { Base64 } from "../../util/Base64";
import { Identity } from "../Identity";
import { Rectangle } from "./shapes/Rectangle";

/**
 * A Tile is a rectangular image that is pulled from a source image.  The Tile
 * contains a dedicated canvas that is used to replicate the tile, as well
 * as a source reference to the original canvas, should it be required.
 * 
 * The tile data is encoded in the offset property, using the source image as
 * the reference basis (i.e. Tile coordinates are relative to the source top-left).
 * 
 * NOTE: This class is meant as a data storage container for image/sprite data.
 */
export class Tile extends Identity {
	constructor ({ alias, x, y, width, height, source, offset, ...rest } = {}) {
		super({ ...rest });

		if(!(source instanceof HTMLCanvasElement)) {
			throw new Error("@source must be an instance of HTMLCanvasElement");
		}

		this.alias = alias;
		this.offset = offset instanceof Rectangle ? offset : new Rectangle({ x, y, width, height });

		/**
		 * HTMLCanvasElement
		 */
		this.tile = document.createElement("canvas");
		this.load(source);

		this.source = source;
	}

	get width() {
		return this.offset.width;
	}
	get height() {
		return this.offset.height;
	}
	get size() {
		return [ this.width, this.height ];
	}

	/**
	 * Alias for the tile canvas.
	 */
	get canvas() {
		return this.tile;
	}
	/**
	 * Get the 2D context of the tile canvas.
	 */
	get ctx() {
		return this.tile.getContext("2d");
	}

	/**
	 * Used to actually create the canvas tile.
	 */
	load(canvas) {
		/**
		 * Erase any existing image data
		 */
		this.ctx.clearRect(0, 0, this.tile.width, this.tile.height);
		this.tile.width = this.offset.width;
		this.tile.height = this.offset.height;

		/**
		 * Draw the source image onto the tile canvas, using the offset as the clipping area
		 */
		this.ctx.drawImage(canvas, this.offset.x, this.offset.y, this.offset.width, this.offset.height, 0, 0, this.tile.width, this.tile.height);

		return this;
	}
	/**
	 * Use this any time the source image is changed.
	 */
	reload() {
		return this.load(this.source);
	}

	/**
	 * Convenience method for creating an ImageData object from the tile
	 */
	toImageData() {
		return this.ctx.getImageData(0, 0, this.tile.width, this.tile.height);
	}
	/**
	 * Convenience method for creating a base64 string from the tile
	 */
	toDataURL(type = "image/png", quality = 1.0) {
		return this.tile.toDataURL(type, quality);
	}

	/**
	 * Convert the Tile into an object, while converting
	 * the tile image as a base64 string via this.toDataURL().
	 * As such, those arguments can be passed here.
	 */
	toObject(type = "image/png", quality = 1.0) {
		return {
			...super.toObject(),

			offset: this.offset.toObject(),
			source: this.toDataURL(type, quality),
		};
	}
	/**
	 * Converts .toObject() to a string JSON.
	 */
	toString() {
		return JSON.stringify(this.toObject());
	}

	/**
	 * Performs the reinstantiation of the Tile from a .toObject() object.
	 */
	async FromObject(object) {
		return await Base64.Decode(object.source).then(source => new Tile({
			...object,
			source,
			offset: Rectangle.FromObject(object.offset),
		}));
	}
};

export default Tile;