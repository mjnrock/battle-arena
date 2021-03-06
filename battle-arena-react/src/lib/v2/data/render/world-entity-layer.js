import Agency from "@lespantsfancy/agency";

import RenderGroup from "./../../util/render/RenderGroup";
import { EntityTemplate as EntityImageRegistryTemplate } from "../../util/render/ImageRegistry";
import { ToCanvasMap } from "../image/tessellator/grid";

export async function load(game, renderGroup) {
    let files = [
        `squirrel`,
        `bunny`,
    ];

    let promises = [];
    for(let file of files) {
        promises.push(
            Agency.Util.Base64.FileDecode(`./assets/images/${ file }.png`)
                .then(canvas => ToCanvasMap(32, 32, canvas, { asTessellation: true }))
                .then(tessellation => {
                    for(let i = 0; i <= 270; i += 90) {
                        tessellation.absolute(24).add(`${ i / 90 }.0`, 1000);
                        renderGroup.imageRegistry.set(
                            tessellation.toSprite({ purgePattern: true }),
                            file,
                            0,
                            i,
                        );
                    }
                })
        );
    }
    
    return await Promise.all(promises);
}

export async function init(game) {
    const renderEntity = new RenderGroup(
        game.world.entities,
        EntityImageRegistryTemplate,
        {
            lookupFns: [
                ({ entity }) => entity === game.world.entities.player ? "squirrel" : "bunny",
                ({ entity }) => 0,
                ({ entity }) => Math.floor(entity.position.facing / 90) * 90,
            ]
        }
    );

    load(game, renderEntity);

    const GCD = 5000;
    game.canvas.eraseFirst();
    game.canvas.onDraw = (dt, elapsed) => {
        game.canvas.drawGrid();

        for(let ent of renderEntity.entities) {
            const prog = ((Date.now() - ent.turn.timeoutStart) % GCD) / GCD;      // % GCD hides information and should only be used for testing
            const sprite = renderEntity.sprite({ entity: ent });

            if(sprite) {
                game.canvas.image(
                    sprite.get(prog * sprite.duration),
                    0,
                    0,
                    game.canvas.tw,
                    game.canvas.th,
                    ent.position.x * game.canvas.tw,
                    ent.position.y * game.canvas.th,
                    game.canvas.tw,
                    game.canvas.th,
                );
                
                //? Draw Pie Timer
                let color = `rgba(95, 160, 80, 0.75)`;
                if(prog >= 0.80) {
                    color = `rgba(196, 74, 74, 0.75)`;
                } else if(prog >= 0.55) {
                    color = `rgba(201, 199, 72, 0.75)`;
                }
                game.canvas.save();
                    game.canvas.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
                        ent.position.x * game.canvas.tw + game.canvas.tw / 2,
                        ent.position.y * game.canvas.th - game.canvas.tw / 2,
                        8,
                        { isFilled: true },
                    );
                game.canvas.restore();
                game.canvas.save();
                    game.canvas.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
                        ent.position.x * game.canvas.tw + game.canvas.tw / 2,
                        ent.position.y * game.canvas.th - game.canvas.tw / 2,
                        7,
                        0,
                        prog * Math.PI * 2,
                        { isFilled: true, counterClockwise: true },
                    );
                game.canvas.restore();
            }
        }
    }
}

export default {
    load,
    init,
};