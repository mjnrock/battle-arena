import Agency from "@lespantsfancy/agency";

import RenderGroup from "../../util/render/RenderGroup";
import { TerrainTemplate as TerrainImageRegistryTemplate } from "../../util/render/ImageRegistry";
import { ToCanvasMap } from "../image/tessellator/grid";

import { TerrainLookup } from "./../entity/components/terrain";

export async function load(game, renderGroup) {
    let files = [
        "grass",
        "dirt",
        "edge-grass-dirt",
        "water",
    ];

    let promises = [];
    for (let file of files) {
        promises.push(
            Agency.Util.Base64.FileDecode(`./assets/images/${file}.png`)
                .then(canvas => ToCanvasMap(32, 32, canvas, { asTessellation: true, includeMeta: true }))
                .then(([ tessellation, meta ]) => {
                    if (file.startsWith("edge")) {
                        const [ t1, t2 ] = file.split("-").slice(1);

                        tessellation.relative(1);
                        tessellation.add(`0.0`, 1);    // The @key pulls that <Canvas> from the canvas map    
                        game.render.repository.get("terrain").set(
                            tessellation.toSprite({ purgePattern: true }),
                            t2,
                            1,
                            0,
                        );

                        tessellation.relative(1);
                        tessellation.add(`0.1`, 1);    // The @key pulls that <Canvas> from the canvas map    
                        game.render.repository.get("terrain").set(
                            tessellation.toSprite({ purgePattern: true }),
                            t2,
                            2,
                            0,
                        );
                    } else {
                        tessellation.relative(~~(meta.width / meta.tw));

                        for (let i = 0; i < meta.width; i += meta.tw) {
                            tessellation.add(`${i / meta.tw}.0`, 1);    // The @key pulls that <Canvas> from the canvas map
                        }

                        game.render.repository.get("terrain").set(
                            tessellation.toSprite({ purgePattern: true }),
                            file,
                            0,
                            0,
                        );
                    }
                })
                .catch(e => { console.error(e); console.warn(`Ensure that "${ file }" is present in the <ImageRegistry>`); })
        );
    }

    return await Promise.all(promises);
}

export async function init(game) {
    const renderTerrain = new RenderGroup(game.world.terrain);

    await load(game);

    // const dirs = [
    //     [ 0, -1, 0 ],
    //     [ 1, 0, 90 ],
    //     [ 0, 1, 180 ],
    //     [ -1, 0, 270 ],

    //     [ -1, -1, 0 ],
    //     [ 1, -1, 90 ],
    //     [ 1, 1, 180 ],
    //     [ -1, 1, 270 ],
    // ];

    renderTerrain.eraseFirst();
    renderTerrain.onDraw = (dt, elapsed) => {
        if (renderTerrain.canvas.width !== game.render.width || renderTerrain.canvas.height !== game.render.height) {
            renderTerrain.canvas.width = game.render.width;
            renderTerrain.canvas.height = game.render.height;
        }

        for (let terrain of renderTerrain.entities) {
            const sprite = game.render.sprite("terrain", { entity: terrain });

            if (sprite) {
                sprite.paint(elapsed, renderTerrain, terrain.position.x * renderTerrain.tw, terrain.position.y * renderTerrain.th);
            }
        }
    }

    return renderTerrain;
}

export default {
    load,
    init,
};