import Helper from "../../../util/helper";
import { PixiJS } from "../../../lib/pixi/Pixi";
import { Layer } from "../../../lib/pixi/Layer";

export function createLayerDebug(game) {
	const layer = new Layer({
		render: (perspective, { dt, now }) => {
			if(!game.config.SHOW_DEBUG) {
				return;
			}
			/**
			 * Clear the overlay graphics, if any
			 */
			layer.overlay.clear();

			//FIXME: I don't like the idea of attaching the debug graphics to the entity like this (see F3 press code) -- maybe create a separate nodal network

			/**
			 * Draw the Entities
			 */
			for(let [ uuid, entity ] of game.realm.worlds.current.entities) {
				let { x: tx, y: ty } = entity.world;
				[ tx, ty ] = entity.world.model.pos(tx, ty);
				[ tx, ty ] = [ tx * game.config.tile.width, ty * game.config.tile.height ];

				if(!entity.animation.debug) {
					entity.animation.debug = new PixiJS.Graphics();

					const text = new PixiJS.Text(uuid, new PixiJS.TextStyle({
						fontFamily: "monospace",
						fill: [ "#ffffff" ],
						align: "center",
						fontSize: 16,
					}));

					text.x += game.config.tile.width / 2;
					text.y -= game.config.tile.height / 2;

					entity.animation.debug.addChild(text);

					entity.animation.sprite.addChild(entity.animation.debug);
				} else {
					entity.animation.debug.visible = false;
				}

				if(perspective.test(tx, ty)) {
					entity.animation.debug.visible = true;
					entity.animation.debug.clear();

					const [ text ] = entity.animation.debug.children;
					text.text = "";
					text.text += "\r\n" + `${ entity.status.state.toUpperCase() }`;
					text.text += "\r\n" + `${ entity.world.facing }°`
					text.text += "\r\n" + `[${ Helper.round(entity.world.x, 10).toFixed(1) } ${ Helper.round(entity.world.y, 10).toFixed(1) }]`;
					text.text += "\r\n" + `(${ Helper.round(entity.world.vx, 10).toFixed(1) } ${ Helper.round(entity.world.vy, 10).toFixed(1) })`;
					let [ x_dest, y_dest ] = entity.ai.wayfinder.pathEnd(1) || [];
					text.text += "\r\n" + (x_dest != null ? `{${ x_dest } ${ y_dest }}` : "");

					entity.animation.debug.lineStyle(2, 0x00FF00);
					entity.animation.debug.drawRing(
						entity.world.model.radius * game.config.tile.width * 2,
						entity.world.model.radius * game.config.tile.height * 2,
						entity.world.model.x * game.config.tile.width,
						entity.world.model.y * game.config.tile.height
					);
				}
			}
		},
	});

	return layer;
};

export default createLayerDebug;