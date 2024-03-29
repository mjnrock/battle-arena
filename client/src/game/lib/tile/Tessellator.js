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
		/**
		 * This can leverage the @directions parameter to either initialize your own direction array,
		 * or you can use some convenience shorthands to iterate directions clockwise from "north".
		 * The @aliaser parameter templates the alias, such as "entity_type.state.facing.frame_index".
		 * The @zones parameter should ultimate represent an { alias: Rectangle } object, where the
		 * value is the zone rectangle, composed of rows and indexes.
		 */
		GridBased: ({ zones, directions = "D4", aliaser } = {}) => (self, { tw, th } = {}) => {
			if(self.source.width % tw !== 0 || self.source.height % th !== 0) {
				throw new Error("Source image dimensions must be evenly divisible by tile dimensions.");
			} else {
				aliaser = aliaser || (({ entity, state, direction, index }) => `${ entity }.${ state }.${ direction }.${ index }`);
			}

			/**
			 * Iterate the main direction types with a convenience flag.
			 */
			if(directions === false) {
				/**
				 * Use << false >> as the flag to ignore directions.
				 */
				directions = [ false ];
			} else if(directions === "D4") {
				directions = [
					"north",
					"east",
					"south",
					"west",
				];
			} else if(directions === "D4X") {
				directions = [
					"north_east",
					"south_east",
					"south_west",
					"north_west",
				];
			} else if(directions === "D8") {
				directions = [
					"north",
					"north_east",
					"east",
					"south_east",
					"south",
					"south_west",
					"west",
					"north_west",
				];
			}

			let zoneObj = {},
				zi = 0;
			if(Array.isArray(zones)) {
				/**
				 * The @zones parameter is an array of keys.
				 */
				let zy = 0;
				for(let state of zones) {
					zoneObj[ state ] = {
						x: 0,
						y: zy,
						w: self.source.width,
						h: th * directions.length,
					};

					zy += zoneObj[ state ].h;
				}
			} else if(typeof zones === "object") {
				/**
				 * The @zones parameter is a zone-object.
				 */
				zoneObj = zones;
				zones = Object.keys(zones);
			} else {
				/**
				 * The @zones parameter is false and needs an iteration-stub-value.
				 */
				zoneObj = {
					0: {
						x: 0,
						y: 0,
						w: self.source.width,
						h: self.source.height,
					},
				};
				zones = false;
			}

			/**
			 * The main canvas-frame repository.
			 */
			const tileset = new TileSet({ source: self.source, tw, th });

			/**
			 * Iterate the framed zones.
			 */
			for(let zone_key in zoneObj) {
				/**
				 * "zone" is an x,y,w,h range for a given entity's status state.
				 */
				let zone = zoneObj[ zone_key ];

				/**
				 * Iterate the directions, using << dir = false && directions.length === 1 >> as the flag to ignore.
				 */
				for(let [ diri, dir ] of Object.entries(directions)) {
					/**
					 * "row" is the facing direction of the entity.
					 */
					let row = Array.apply(null, { length: Math.ceil(zone.w / tw) }).map((v, i) => {
						/**
						 * Create a frame usings it respective cell coordinates.
						 */
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
						/**
						 * Cache the current frame.
						 */
						const frame = row[ i ];

						/**
						 * If @dir is false, then use the index as the alias.
						 */
						const alias = dir ? aliaser({
							entity: self.alias,
							state: zones[ zi ],
							direction: dir,
							index: i,
						}) : i;

						/**
						 * Assign the alias to the frame.
						 */
						frame.alias = alias;

						/**
						 * Attach that frame data to the tileset.
						 */
						tileset.addTileData(frame);
					}
				}

				zi += 1;
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