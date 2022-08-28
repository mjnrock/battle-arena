import { Identity } from "../../util/Identity";
import { Registry } from "../../util/Registry";

import { Base64 } from "../../util/Base64";
import Tile from "../tile/package";
import { Zone } from "../tile/animate/Sequencer";

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
	}

	//#region Initialization Methods
	/**
	 * This expects @paths to conform with Base64.DecodeFiles() and will return
	 * a (optionally aliased) Registry of { alias: spritesheet<canvas> } pairs to
	 * be used by for tessellation.  If needed, a @middleware reducer array stack can
	 * be passed to modify the *canvas* before it is registered (e.g. scaling, filters, etc.).
	 */
	async loadCanvasSpriteSheet(paths = {}, middleware = [], allowAnonymous = false) {
		this.canvases = await Base64.DecodeFiles(paths, allowAnonymous).then(map => {
			const registry = new Registry();

			for(let [ alias, canvas ] of Object.entries(map)) {
				for(let fn of middleware) {
					canvas = fn({ canvas, alias, paths, self: this }) || canvas;
				}

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

		for(let [ alias, argsObj ] of Object.entries(scoreObj)) {
			if(Array.isArray(argsObj)) {
				/**
				 * If an array was used, assume it contains the Measures
				 */
				argsObj = {
					measures: argsObj,
				};
			}

			const score = new Tile.Animate.Score(argsObj);
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
			score: this.scores[ scoreAlias ],
			spritesheet: this.spritesheets[ spritesheetAlias ],
			autoPlay: true,

			...opts,
		});
	}
	createTracks(createTrackArgs = []) {
		return createTrackArgs.map(args => this.createTrack(...args));
	}

	createSequence({ spritesheet, timestep = 250, path, ...rest } = {}) {
		return Tile.Animate.Sequencer.Create({
			spritesheet: this.spritesheets[ spritesheet ],
			path: path,
			timestep: timestep,
			autoPlay: true,

			...rest,
		});
	}
	createSequences(createSequencerArgs = [], path) {
		if(path) {
			return createSequencerArgs.map(args => this.createSequence({ path, ...args }));
		}

		return createSequencerArgs.map(args => this.createSequence(args));
	}
	//#endregion Begin Convenience/Facilitation Methods
};

export default AssetManager;