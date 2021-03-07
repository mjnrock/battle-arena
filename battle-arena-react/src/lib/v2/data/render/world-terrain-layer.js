import Agency from "@lespantsfancy/agency";

import RenderGroup from "../../util/render/RenderGroup";
import { TerrainTemplate as TerrainImageRegistryTemplate } from "../../util/render/ImageRegistry";
import { ToCanvasMap } from "../image/tessellator/grid";

import { TerrainLookup } from "./../entity/components/terrain";

export async function load(game, renderGroup) {
    let files = [
        "grass",
        "water",
    ];

    let promises = [];
    for(let file of files) {
        promises.push(
            Agency.Util.Base64.FileDecode(`./assets/images/${ file }.png`)
                .then(canvas => ToCanvasMap(32, 32, canvas, { asTessellation: true }))
                .then(tessellation => {
                    // for(let i = 0; i <= 270; i += 90) {
                    //     tessellation.absolute(24).add(`${ i / 90 }.0`, 1000);
                    //     renderGroup.imageRegistry.set(
                    //         tessellation.toSprite({ purgePattern: true }),
                    //         file,
                    //         0,
                    //         i,
                    //     );
                    // }
                    tessellation.absolute(24).add(`0.0`, 1000);
                    renderGroup.imageRegistry.set(
                        tessellation.toSprite({ purgePattern: true }),
                        file,
                        0,
                        0,
                    );
                })
        );
    }
    
    return await Promise.all(promises);
}

export async function init(game) {
    const renderTerrain = new RenderGroup(
        game.world.terrain,
        TerrainImageRegistryTemplate,
        {
            lookupFns: [
                ({ entity }) => TerrainLookup(entity.terrain.type),
                ({ entity }) => 0,
                ({ entity }) => Math.floor(entity.position.facing / 90) * 90,
            ]
        }
    );

    load(game, renderTerrain);

    renderTerrain.eraseFirst();
    renderTerrain.onDraw = (dt, elapsed) => {
        if(renderTerrain.canvas.width !== game.canvas.width || renderTerrain.canvas.height !== game.canvas.height) {
            renderTerrain.canvas.width = game.canvas.width;
            renderTerrain.canvas.height = game.canvas.height;
        }

        for(let terrain of renderTerrain.entities) {
            const prog = ((Date.now() - terrain.turn.timeoutStart) % game.config.GCD) / game.config.GCD;      // % game.config.GCD hides information and should only be used for testing
            const sprite = renderTerrain.sprite({ entity: terrain });

            if(sprite) {
                renderTerrain.image(
                    sprite.get(prog * sprite.duration),
                    0,
                    0,
                    renderTerrain.tw,
                    renderTerrain.th,
                    terrain.position.x * renderTerrain.tw,
                    terrain.position.y * renderTerrain.th,
                    renderTerrain.tw,
                    renderTerrain.th,
                );
            }
        }
    }

    return renderTerrain;
}

export default {
    load,
    init,
};