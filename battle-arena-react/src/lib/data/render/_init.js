import { loadCreature, loadTerrain, loadEffect } from "./entity";
import drawEntityLayer from "./world-entity-layer";
import drawTerrainLayer from "./world-terrain-layer";
import drawUILayer from "./world-ui-layer";

export async function init(game) {
    //  Load Images
    await game.render.loadImages(loadCreature);
    await game.render.loadImages(loadTerrain);
    await game.render.loadImages(loadEffect);

    game.render.addAnimationLayers(
        drawTerrainLayer,
        drawEntityLayer,
        drawUILayer,
    );

    return game;
}

export default init;