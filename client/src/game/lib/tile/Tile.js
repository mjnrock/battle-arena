import Base64 from "../../util/Base64";

import Identity from "../Identity";
import Rectangle from "./shapes/Rectangle";

/**
 * Use this class from another class, such that @source will always be
 * loaded before Tile is instantiatied.
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
		this.source = document.createElement("canvas");
		this.load(source);
	}

	get canvas() {
		return this.source;
	}
	get ctx() {
		return this.source.getContext("2d");
	}

	load(canvas) {
        this.ctx.clearRect(0, 0, this.source.width, this.source.height);
		this.source.width = this.boundary.width;
		this.source.height = this.boundary.height;

        this.ctx.drawImage(canvas, this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height, 0, 0, this.source.width, this.source.height);
		
		return this;
	}

	toImageData() {
		return this.ctx.getImageData(0, 0, this.source.width, this.source.height);
	}
	toDataURL(type = "image/png", quality = 1.0) {
		return this.source.toDataURL(type, quality);
	}

	toObject(type = "image/png", quality = 1.0) {
		return {
			...super.toObject(),

			boundary: this.boundary.toObject(),
			source: this.toDataURL(type, quality),
		};
	}
	toString() {
		return JSON.stringify(this.toObject());
	}

	async FromObject(object) {
		return await Base64.Decode(object.source).then(source => new Tile({
			...object,
			source,
			boundary: Rectangle.FromObject(object.boundary),
		}));
	}
};

export default Tile;