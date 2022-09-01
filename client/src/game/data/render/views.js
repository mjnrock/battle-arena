import { Collection } from "../../util/Collection";

import { View } from "../../lib/pixi/View";
import { Perspective } from "../../lib/pixi/Perspective";

import { createLayerTerrain } from "./layer/terrain";
import { createLayerEntity } from "./layer/entity";
import { createLayerDebug } from "./layer/debug";

export function createViews(game) {
	/**
	 * Create the View collection
	 */
	const collection = new Collection({
		/**
		 * This should map to an existing key in items below
		 */
		current: "gameplay",

		/**
		 * All of the potential Views that could be selected to be used
		 */
		items: {
			gameplay: new View({
				/**
				 * The child Layers
				 */
				layers: {
					terrain: createLayerTerrain(game),
					entity: createLayerEntity(game),
					debug: createLayerDebug(game),
				},

				observe() {
					this.perspective.x = this.subject.world.x * game.config.tile.width;
					this.perspective.y = this.subject.world.y * game.config.tile.height;

					this.container.x = -this.perspective.x + this.perspective.width / 2 - game.config.tile.width * 2;
					this.container.y = -this.perspective.y + this.perspective.height / 2 - game.config.tile.height * 2;

					game.config.viewport.offset = {
						x: this.container.x,
						y: this.container.y,
					};
				},

				/**
				 * The Perspective constraint object
				 */
				perspective: new Perspective({
					ref: game,

					x: game.config.tile.width * -1,
					y: game.config.tile.height * -1,
					width: window.innerWidth + (game.config.tile.width * 2),
					height: window.innerHeight + (game.config.tile.height * 2),
				}),
			}),
		},
	});


	/**
	 * Make all non-current Views invisible
	 */
	for(let [ key, item ] of collection) {
		item.container.visible = item === collection.current;
	}

	return collection;
};