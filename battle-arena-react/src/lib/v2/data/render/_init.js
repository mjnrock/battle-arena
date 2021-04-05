import Agency from "@lespantsfancy/agency";

import RenderManager from "./../../manager/RenderManager";

import initImageRepository from "./repository";
import { loadEntity, loadTerrain } from "./entity";
import drawEntityLayer from "./world-entity-layer";
import drawTerrainLayer from "./world-terrain-layer";
import drawUILayer from "./world-ui-layer";

export async function init(game) {
    game.render = new RenderManager(game, {
        width: game.world.current.width * game.config.render.tile.width,
        height: game.world.current.height * game.config.render.tile.height,
        tw: game.config.render.tile.width,
        th: game.config.render.tile.height,
        repository: initImageRepository()
    });
    game.render.config.clearBeforeDraw = true;

    //  Load Images
    await game.render.loadImages(loadEntity);
    await game.render.loadImages(loadTerrain);

    game.render.addAnimationLayers(
        drawTerrainLayer,
        drawEntityLayer,
        drawUILayer,
    );

    return game;
}

export default init;