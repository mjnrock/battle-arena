import Agency from "@lespantsfancy/agency";
import { ToCanvasMap } from "../image/tessellator/grid";

export async function loadEntity(game) {
    //NOTE  If you want to add more files, they MUST have a corresponding "1st dimension" key in renderGroup (cf. ImageRegistry.EntityTemplate)
    let files = [
        `squirrel`,
        `bunny`,
        `bear`,
        // `fire`,
        // `ghost-squirrel`,
        // `ghost-bunny`,
    ];

    let promises = [];
    for(let file of files) {
        if(file === "bear") {
            promises.push(
                Agency.Util.Base64.FileDecode(`./assets/images/${ file }.png`)
                    .then(canvas => ToCanvasMap(96, 96, canvas, { asTessellation: true }))
                    .then(tessellation => {
                        for(let i = 0; i <= 270; i += 90) {
                            if(i === 90) {
                                tessellation.relative(4).add(`0.2`, 4).row().add(`0.${ i / 90 }`, 2).add(`0.3`, 2);
                            } else {
                                tessellation.absolute(24).add(`0.${ i / 90 }`, 1000);
                            }
                            // game.render.repository.get("entity").set(
                            //     tessellation.toSprite({ purgePattern: true }),
                            //     file,
                            //     0,
                            //     i,
                            // );
                            game.render.repository.get("entity").get(file, 0, i).set(0, tessellation.toSprite({ purgePattern: true }));
                        }
                    })
                    .catch(e => { console.error(e); console.warn(`Ensure that "${ file }" is present in the <ImageRegistry>`); })
            );
        } else {
            promises.push(
                Agency.Util.Base64.FileDecode(`./assets/images/${ file }.png`)
                    .then(canvas => ToCanvasMap(32, 32, canvas, { asTessellation: true }))
                    .then(tessellation => {
                        for(let i = 0; i <= 270; i += 90) {
                            tessellation.absolute(24).add(`0.${ i / 90 }`, 1000);
                            // game.render.repository.get("entity").set(
                            //     tessellation.toSprite({ purgePattern: true }),
                            //     file,
                            //     0,
                            //     i,
                            // );
                            game.render.repository.get("entity").get(file, 0, i).set(0, tessellation.toSprite({ purgePattern: true }));
                        }
                    })
                    .catch(e => { console.error(e); console.warn(`Ensure that "${ file }" is present in the <ImageRegistry>`); })
            );
        }
    }
    
    return await Promise.all(promises);
}

export async function loadTerrain(game) {
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
                        game.render.repository.get("terrain").get(t2, 0, 0).set(1, tessellation.toSprite({ purgePattern: true }));

                        tessellation.relative(1);
                        tessellation.add(`0.1`, 1);    // The @key pulls that <Canvas> from the canvas map
                        game.render.repository.get("terrain").get(t2, 0, 0).set(2, tessellation.toSprite({ purgePattern: true }));
                    } else {
                        tessellation.relative(~~(meta.width / meta.tw));

                        for (let i = 0; i < meta.width; i += meta.tw) {
                            tessellation.add(`${i / meta.tw}.0`, 1);    // The @key pulls that <Canvas> from the canvas map
                        }

                        game.render.repository.get("terrain").get(file, 0, 0).set(0, tessellation.toSprite({ purgePattern: true }));
                    }
                })
                .catch(e => { console.error(e); console.warn(`Ensure that "${ file }" is present in the <ImageRegistry>`); })
        );
    }

    return await Promise.all(promises);
}

export default {
    loadTerrain,
    loadEntity,
};