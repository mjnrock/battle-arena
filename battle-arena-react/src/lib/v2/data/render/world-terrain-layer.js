import Agency from "@lespantsfancy/agency";

import RenderGroup from "../../util/render/RenderGroup";
import { TerrainTemplate as TerrainImageRegistryTemplate } from "../../util/render/ImageRegistry";
import { ToCanvasMap } from "../image/tessellator/grid";

import { DictTerrain, TerrainLookup } from "./../entity/components/terrain";

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
                        renderGroup.imageRegistry.set(
                            tessellation.toSprite({ purgePattern: true }),
                            t2,
                            1,
                            0,
                        );

                        tessellation.relative(1);
                        tessellation.add(`0.1`, 1);    // The @key pulls that <Canvas> from the canvas map    
                        renderGroup.imageRegistry.set(
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

                        renderGroup.imageRegistry.set(
                            tessellation.toSprite({ purgePattern: true }),
                            file,
                            0,
                            0,
                        );
                    }
                })
                .catch(e => console.error(`[Tessellation Failed]:  Ensure "${file}" is present in the WorldTerrainLayer <ImageRegistry> dimensional key range.  No <Sprite> was added to the registry.`))
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

    await load(game, renderTerrain);

    const dirs = [
        [ 0, -1, 0 ],
        [ 1, 0, 90 ],
        [ 0, 1, 180 ],
        [ -1, 0, 270 ],

        [ -1, -1, 0 ],
        [ 1, -1, 90 ],
        [ 1, 1, 180 ],
        [ -1, 1, 270 ],
    ];

    renderTerrain.eraseFirst();
    renderTerrain.onDraw = (dt, elapsed) => {
        if (renderTerrain.canvas.width !== game.render.width || renderTerrain.canvas.height !== game.render.height) {
            renderTerrain.canvas.width = game.render.width;
            renderTerrain.canvas.height = game.render.height;
        }

        for (let terrain of renderTerrain.entities) {
            const sprite = renderTerrain.sprite({ entity: terrain });

            if (sprite) {
                const image = sprite.get(elapsed);

                renderTerrain.image(
                    image,
                    0,
                    0,
                    renderTerrain.tw,
                    renderTerrain.th,
                    terrain.position.x * renderTerrain.tw,
                    terrain.position.y * renderTerrain.th,
                    renderTerrain.tw,
                    renderTerrain.th,
                );

                //TODO  Bake the terrain on World load and rebake tiles/neighbors if something changes in game (e.g. player plows the land)
                if (terrain.terrain.type === DictTerrain.DIRT.type) {
                    function drawImage(ctx, image, x, y, scale, rotation){
                        ctx.save();
                        ctx.setTransform(scale, 0, 0, scale, x, y);
                        ctx.rotate(rotation);
                        ctx.drawImage(image, 0, 0);
                        ctx.restore();
                    } 

                    let edgeSprite = renderTerrain.sprite("dirt", 1, 0);
                    let edgeSpriteCorner = renderTerrain.sprite("dirt", 2, 0);

                    if (edgeSprite && edgeSpriteCorner) {
                        const edgeImage = edgeSprite.get(elapsed);
                        const edgeImageCorner = edgeSpriteCorner.get(elapsed);
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");

                        canvas.width = edgeImage.width;
                        canvas.height = edgeImage.height;

                        //  Base Image
                        ctx.drawImage(image, 0, 0);
                        
                        let neighbors = dirs.map(([ dx, dy, theta ]) => {
                            let neigh = game.world.terrain[ `${ terrain.position.x + dx }.${ terrain.position.y + dy }` ];
    
                            if(neigh && neigh.terrain.type === DictTerrain.GRASS.type) {
                                if(theta === 0) {
                                    return [ !(dx === 0 || dy === 0), image => [ 0, 0, 1, 0 ] ];
                                } else if(theta === 90) {
                                    return [ !(dx === 0 || dy === 0), image => [ image.width, 0, 1, Math.PI / 2 ] ];
                                } else if(theta === 180) {
                                    return [ !(dx === 0 || dy === 0), image => [ image.width, image.height, 1, Math.PI ] ];
                                } else if(theta === 270) {
                                    return [ !(dx === 0 || dy === 0), image => [  0, image.height, 1, -Math.PI / 2 ] ];
                                }
                            }
    
                            return false;
                        }).filter(n => n !== false);

                        //  Edge Image(s)
                        for(let [ isCorner, fn ] of neighbors) {
                            const image = isCorner ? edgeImageCorner : edgeImage;
                            
                            drawImage(ctx, image, ...fn(image));
                        }

                        renderTerrain.image(
                            canvas,
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
        }
    }

    return renderTerrain;
}

export default {
    load,
    init,
};