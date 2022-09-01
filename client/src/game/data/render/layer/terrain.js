import { Bitwise } from "../../../util/Bitwise";

import { Layer } from "../../../lib/pixi/Layer";
import { EnumEdgeFlag } from "../../components/terrain";

export function createLayerTerrain(game) {
	function drawEdgeMask(graphics, node) {
		/**
		 * Future proofs against resolution scaling
		 */
		let factor = game.config.tile.width / 32;
		let passes = [
			[ factor * 3, factor * 3 ],
			[ factor * 5, factor * 5 ],
			[ factor * 7, factor * 7 ],
		];

		/**
		 * Iterate each of the shading passes, drawing the relevant edges
		 */
		let i = 0;
		for(let [ w, h ] of passes) {
			let [ tw, th ] = [ game.config.tile.width, game.config.tile.height ];

			//* Begin the N, S, E, W edges
			graphics.beginFill(0x000000, 0.1 / (i + 1));
			// graphics.beginFill(0xFF0000, 0.5 / (i + 1));

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.LEFT)) {
				graphics.drawRect(node.world.x * tw - w / 2, node.world.y * th, w, th);
			}

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.RIGHT)) {
				graphics.drawRect(node.world.x * tw + tw - w + w / 2, node.world.y * th, w, th);
			}

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.TOP)) {
				graphics.drawRect(node.world.x * tw, node.world.y * th - h / 2, tw, h);
			}

			if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.BOTTOM)) {
				graphics.drawRect(node.world.x * tw, node.world.y * th + th - h + h / 2, tw, h);
			}

			graphics.endFill();

			//* Begin the NW, NE, SE, SW edges
			// graphics.beginFill(0x0000FF, 0.5);

			// let radius = 10;
			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.TOP_LEFT)) {
			// 	graphics.drawRect(node.world.x * tw, node.world.y * th, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + radius, node.world.y * th + radius, radius);
			// }

			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.TOP_RIGHT)) {
			// 	graphics.drawRect(node.world.x * tw + tw - radius, node.world.y * th, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + tw - radius, node.world.y * th + radius, radius);
			// }

			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.BOTTOM_LEFT)) {
			// 	graphics.drawRect(node.world.x * tw, node.world.y * th + th - radius, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + radius, node.world.y * th + th - radius, radius);
			// }

			// if(Bitwise.has(node.terrain.edges, EnumEdgeFlag.BOTTOM_RIGHT)) {
			// 	graphics.drawRect(node.world.x * tw + tw - radius, node.world.y * th + th - radius, radius, radius);
			// 	// graphics.drawCircle(node.world.x * tw + tw - radius, node.world.y * th + th - radius, radius);
			// }

			// graphics.endFill();

			++i;
		}
	}

	const layer = new Layer({
		render: (perspective, { dt, now }) => {
			/**
			 * Clear the overlay graphics, if any
			 */
			layer.overlay.clear();

			/**
			 * Draw the Terrain
			 */
			for(let [ id, node ] of game.realm.worlds.current.nodes) {
				let { x: tx, y: ty } = node.world;
				[ tx, ty ] = [ tx * game.config.tile.width, ty * game.config.tile.height ];

				if(perspective.test(tx, ty) && node.animation.track) {
					node.animation.sprite.visible = true;

					node.animation.track.next(now);
					node.animation.sprite.texture = node.animation.track.current;

					node.animation.sprite.x = node.world.x * game.config.tile.width;
					node.animation.sprite.y = node.world.y * game.config.tile.height;

					drawEdgeMask(layer.overlay, node);
				} else {
					node.animation.sprite.visible = false;
				}
			}
		},
	});

	return layer;
};

export default createLayerTerrain;