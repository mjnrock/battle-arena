import { Identity } from "../Identity";
import { Registry } from "../Registry";

import { Base64 } from "../../util/Base64";
import Tile from "../tile/package";

/**
 * Due to the intrinsic async nature of external asset loading, the
 * AssetManager expects all asset loading (and therefore variable initialization)
 * to be completed **after** the AssetManager is initialized.
 */
export class AssetManager extends Identity {
	static Algorithms = Tile.Tessellator.Algorithms;

	constructor ({ ...opts } = {}) {
		super({ ...opts });

		/**
		 * Contains all of the { alias: spritesheet<canvas> } pairs.
		 */
		this.canvases = null;

		/**
		 * The tessellations to be used for spritesheets.
		 */
		this.tessellations = null;		
		/**
		 * The spritesheets to be used for Scoring.
		 */
		this.spritesheets = null;

		/**
		 * The scores to be used for track creation.
		 */
		this.scores = null;

		//TODO: Create an actual asset initialization for the Game using this new class to help maintain it
	}

	//#region Initialization Methods
	/**
	 * This expects @paths to conform with Base64.DecodeFiles() and will return
	 * a (optionally aliased) Registry of { alias: spritesheet<canvas> } pairs to
	 * be used by for tessellation.
	 * 
	 * (paths = [], allowAnonymous = false)
	 */
	async loadCanvasSpriteSheet(paths = {}) {
		this.canvases = await Base64.DecodeFiles(paths).then(map => {
			const registry = new Registry();

			for(let [ alias, canvas ] of Object.entries(map)) {
				registry.registerWithAlias(canvas, alias);
			}

			return registry;
		});

		return this;
	}

	/**
	 * This expects an `array` of Tessellation.FromCanvas() object-arguments.
	 * As this is also a Registry, be sure to register the tessellations with
	 * the appropriate @alias.
	 * 
	 * NOTE: This will also initialize the spritesheet registry, extracting the
	 * tileset from each tessellator under the same @alias.
	 * 
	 * ({ canvas, alias, algorithm, args = [] } = {})
	 */
	async loadTessellations(fromCanvasArgs = []) {
		this.tessellations = new Registry();
		this.spritesheets = new Registry();

		if(!Array.isArray(fromCanvasArgs)) {
			fromCanvasArgs = [ fromCanvasArgs ];
		}

		//TODO: Tessellations should be able to be selected by the alias to pull from the current .canvases registry.

		for(let argsObj of fromCanvasArgs) {
			const tessellation = Tile.Tessellator.FromCanvas(argsObj);
			this.tessellations.registerWithAlias(tessellation, argsObj.alias);

			const spritesheet = new Tile.Pixi.SpriteSheet({
				tileset: tessellation.tileset,
			});
			this.spritesheets.registerWithAlias(spritesheet, argsObj.alias);
		}

		return this;
	}

	/**
	 * Populate a registry with { alias: score } pairs, based on initialization arguments.
	 */
	async loadScores(scoreObj = {}) {
		this.scores = new Registry();

		for(let [ alias, args ] of Object.entries(scoreObj)) {
			const score = new Tile.Animate.Score(...args);
			this.scores.registerWithAlias(score, alias);
		}

		return this;

	}
	/**
	 * Populate a registry with { alias: score } pairs, based on initialization arguments.
	 * This version uses Score.FromArray() to create the score, instead.
	 */
	async loadScoresFromArray(scoreObj = {}) {
		this.scores = new Registry();

		for(let [ alias, array ] of Object.entries(scoreObj)) {
			const score = Tile.Animate.Score.FromArray(array);

			this.scores.registerWithAlias(score, alias);
		}

		return this;
	}
	//#endregion Initialization Methods



	//#region Begin Convenience/Facilitation Methods
	createTrack(scoreAlias, spritesheetAlias, opts = {}) {
		return Tile.Animate.Track.Create({
			//TODO: Load the score from the registry
			score: this.scores[ scoreAlias ],

			//TODO: Load the spritesheet from the registry
			spritesheet: this.spritesheets[ spritesheetAlias ],
			autoPlay: true,

			...opts,
		});
	}
	//#endregion Begin Convenience/Facilitation Methods
};

export default AssetManager;