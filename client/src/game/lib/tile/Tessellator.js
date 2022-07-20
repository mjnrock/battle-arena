import Base64 from "../../util/Base64";

export class Tessellator {
	static Algorithms = {};

	constructor ({ alias, canvas } = {}) {
		this.alias = alias;
		this.canvas = canvas;

		this.tiles = new Map();
		this.config = {
			width: canvas.width,
			height: canvas.height,
			tiles: {
				width: null,
				height: null,
			},
		};
	}

	async tessellate() {
		const { canvas } = this;

	}

	static async FetchFile(url, alias) {
		const canvas = await Base64.FileDecode(url);

		return new Tessellator({ alias, canvas });
	}
};

export default Tessellator;