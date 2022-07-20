import { Base64 } from "../../util/Base64";
import { Identity } from "../Identity";
import { Rectangle } from "./shapes/Rectangle";

/**
 * A Tile is a rectangular image that is pulled from a source image.  The Tile
 * contains a dedicated canvas that is used to replicate the snippet, as well
 * as a source reference to the original canvas, should it be required.
 * 
 * The tile data is encoded in the boundary property, using the source image as
 * the reference basis (i.e. Tile coordinates are relative to the source top-left).
 * 
 * NOTE: This class is meant as a storage container for sprite data, and
 * therefore explicitly does not use any PIXI references -- PIXI would be expected to
 * use data from this class.
 */
export class Tile extends Identity {
	constructor ({ x, y, width, height, source, boundary, ...rest } = {}) {
		super({ ...rest });

		if(!(source instanceof HTMLCanvasElement)) {
			throw new Error("@source must be an instance of HTMLCanvasElement");
		}

		this.boundary = boundary instanceof Rectangle ? boundary : new Rectangle({ x, y, width, height });

		/**
		 * HTMLCanvasElement
		 */
		this.snippet = document.createElement("canvas");
		this.load(source);

		this.source = source;
	}

	/**
	 * Alias for the snippet canvas.
	 */
	get canvas() {
		return this.snippet;
	}
	/**
	 * Get the 2D context of the snippet canvas.
	 */
	get ctx() {
		return this.snippet.getContext("2d");
	}

	/**
	 * Used to actually create the canvas snippet.
	 */
	load(canvas) {
		/**
		 * Erase any existing image data
		 */
		this.ctx.clearRect(0, 0, this.snippet.width, this.snippet.height);
		this.snippet.width = this.boundary.width;
		this.snippet.height = this.boundary.height;

		/**
		 * Draw the source image onto the snippet canvas, using the boundary as the clipping area
		 */
		this.ctx.drawImage(canvas, this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height, 0, 0, this.snippet.width, this.snippet.height);

		return this;
	}
	/**
	 * Use this any time the source image is changed.
	 */
	reload() {
		return this.load(this.source);
	}

	/**
	 * Convenience method for creating an ImageData object from the snippet
	 */
	toImageData() {
		return this.ctx.getImageData(0, 0, this.snippet.width, this.snippet.height);
	}
	/**
	 * Convenience method for creating a base64 string from the snippet
	 */
	toDataURL(type = "image/png", quality = 1.0) {
		return this.snippet.toDataURL(type, quality);
	}

	/**
	 * Convert the Tile into an object, while converting
	 * the snippet image as a base64 string via this.toDataURL().
	 * As such, those arguments can be passed here.
	 */
	toObject(type = "image/png", quality = 1.0) {
		return {
			...super.toObject(),

			boundary: this.boundary.toObject(),
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
			boundary: Rectangle.FromObject(object.boundary),
		}));
	}
};

export default Tile;