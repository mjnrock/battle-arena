import { Layer } from "../../../lib/pixi/Layer";

export function createLayerEntity(game) {
	const layer = new Layer({
		render: (perspective, { dt, now }) => {
			/**
			 * Clear the overlay graphics, if any
			 */
			layer.overlay.clear();

			/**
			 * Draw the Entities
			 */
			for(let [ uuid, entity ] of game.realm.worlds.current.entities) {
				let { x: tx, y: ty } = entity.world;
				[ tx, ty ] = entity.world.model.pos(tx, ty);
				[ tx, ty ] = [ tx * game.config.tile.width, ty * game.config.tile.height ];

				if(perspective.test(tx, ty) && entity.animation.track) {
					entity.animation.sprite.visible = true;

					entity.animation.track.next(now, entity);
					entity.animation.sprite.texture = entity.animation.track.current(entity);

					entity.animation.sprite.x = entity.world.x * game.config.tile.width + (game.config.tile.width * 0.5);
					entity.animation.sprite.y = entity.world.y * game.config.tile.height + (game.config.tile.height * 0.5);
				} else {
					entity.animation.sprite.visible = false;
				}
			}
		},
	});

	return layer;
};

export default createLayerEntity;