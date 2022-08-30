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
		GridBased: (self, { tw, th } = {}) => {
			// console.info(self.source.width, tw, self.source.height, th, self.source.width % tw, self.source.height % th)
			if(self.source.width % tw !== 0 || self.source.height % th !== 0) {
				throw new Error("Source image dimensions must be evenly divisible by tile dimensions.");
			}

			const tileset = new TileSet({ source: self.source, tw, th });
			const directions = [ "north", "east", "south", "west" ];

			const name = ({ entity, state, direction, index }) => `${ entity }.${ state }.${ direction }.${ index }`;

			//STUB: The @enumStates are only appropriate for *some* sprites (e.g. creatures) -- abstract this as a hyperparameter.
			if(self.alias === "squirrel" || self.alias === "bunny") {
				let enumState = [ "normal", "moving" ],		//! This particular row is why this is conditionally scoped right now
					zones = {},
					zx = 0,
					zy = 0;
				for(let zone of enumState) {
					zones[ zone ] = {
						x: zx,
						y: zy,
						w: self.source.width,
						h: th * directions.length,
					};

					zy += zones[ zone ].h;
				}

				let zi = 0;
				for(let status_state in zones) {
					/**
					 * "zone" is an x,y,w,h range for a given entity's status state.
					 */
					let zone = zones[ status_state ];
					for(let [ diri, dir ] of Object.entries(directions)) {
						/**
						 * "row" is the facing direction of the entity.
						 */
						let row = Array.apply(null, { length: Math.ceil(zone.w / tw) }).map((v, i) => {
							let frame = {
								alias: null,
								x: zone.x + i * tw,
								y: zone.y + diri * th,
								width: tw,
								height: th,
							};

							return frame;
						});

						/**
						 * "frame" is the animation-step frame.
						 */
						for(let i in row) {
							const frame = row[ i ];
							const alias = name({
								entity: self.alias,
								state: enumState[ zi ],
								direction: dir,
								index: i,
							});

							frame.alias = alias;

							tileset.addTileData(frame);
						}
					}

					zi += 1;
				}

			} else {
				for(let y = 0; y < tileset.height; y += th) {
					let index = 0,
						diri = 0;
					for(let x = 0; x < tileset.width; x += tw) {
						const direction = directions[ diri ];
						const alias = name({
							entity: self.alias,
							state: "normal",
							direction: direction,
							index: index,
						});

						tileset.addTileData({
							alias: alias,
							x,
							y,
							width: tw,
							height: th,
						});

						++index;
					}
					++diri;

					if(diri >= directions.length) {
						diri = 0;
					}
				}
			}

			return tileset;
		},
	};

	constructor ({ alias, source } = {}) {
		this.alias = alias;
		this.source = source;

		this.tileset = null;
	}

	/**
	 * Perform the tessellation algorithm on the source image.
	 */
	tessellate(algorithm, ...args) {
		const tileset = algorithm(this, ...args);

		this.tileset = tileset;

		return tileset;
	}

	/**
	 * Asynchronously loads a source image, optionally tessellating it if
	 * an algorithm is provided; else, the new Tessellator will be returned
	 * without tessellation.
	 */
	static async FromFile({ url, alias, algorithm, args = [] } = {}) {
		const canvas = await Base64.DecodeFile(url);
		const tessellator = new Tessellator({ alias, source: canvas });

		if(typeof algorithm !== "function") {
			return tessellator;
		}

		tessellator.tessellate(algorithm, ...args);

		return tessellator;
	}
	/**
	 * Create a new Tessellator from a source image, optionally tessellating it
	 * if an algorithm is provided; else, the new Tessellator will be returned
	 * without tessellation.
	 */
	static FromCanvas({ canvas, alias, algorithm, args = [] } = {}) {
		const tessellator = new Tessellator({ alias, source: canvas });

		if(typeof algorithm !== "function") {
			return tessellator;
		}

		tessellator.tessellate(algorithm, ...args);

		return tessellator;
	}
};

export default Tessellator;