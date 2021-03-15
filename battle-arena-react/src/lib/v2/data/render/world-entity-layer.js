import Agency from "@lespantsfancy/agency";

import RenderGroup from "./../../util/render/RenderGroup";
import { EntityTemplate as EntityImageRegistryTemplate } from "../../util/render/ImageRegistry";
import { ToCanvasMap } from "../image/tessellator/grid";
import SpriteStack from "../../util/render/SpriteStack";
import Sprite from "../../util/render/Sprite";

export async function load(game) {
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
                            game.render.repository.get("entity").set(
                                tessellation.toSprite({ purgePattern: true }),
                                file,
                                0,
                                i,
                            );
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
                            game.render.repository.get("entity").set(
                                tessellation.toSprite({ purgePattern: true }),
                                file,
                                0,
                                i,
                            );
                        }
                    })
                    .catch(e => { console.error(e); console.warn(`Ensure that "${ file }" is present in the <ImageRegistry>`); })
            );
        }
    }
    
    return await Promise.all(promises);
}

export async function init(game) {
    const renderEntity = new RenderGroup(game.world.entities);

    await load(game);

    renderEntity.eraseFirst();
    renderEntity.onDraw = (dt, elapsed) => {
        if(renderEntity.canvas.width !== game.render.width || renderEntity.canvas.height !== game.render.height) {
            renderEntity.canvas.width = game.render.width;
            renderEntity.canvas.height = game.render.height;
        }

        for(let ent of renderEntity.entities) {
            const prog = ((Date.now() - ent.turn.timeoutStart) % game.config.GCD) / game.config.GCD;      // % game.config.GCD hides information and should only be used for testing
            
            //STUB  Dynamically add <Sprite(s)> // const sprite = new SpriteStack([ renderEntity.sprite({ entity: ent }), renderEntity.sprite({ entity: game.world.entities[ `player` ] }) ]);
            const sprite = new SpriteStack([ game.render.sprite("entity", { entity: ent }) ]);

            if (sprite) {
                const { width: frameWidth } = sprite.paint(elapsed, renderEntity, ent.position.x * renderEntity.tw, ent.position.y * renderEntity.th);
                
                //? Draw Pie Timer
                let color = `rgba(95, 160, 80, 0.75)`;
                if(prog >= 0.80) {
                    color = `rgba(196, 74, 74, 0.75)`;
                } else if(prog >= 0.55) {
                    color = `rgba(201, 199, 72, 0.75)`;
                }
                renderEntity.save();
                    renderEntity.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
                        ent.position.x * renderEntity.tw + frameWidth / 2,
                        ent.position.y * renderEntity.th - renderEntity.th / 2,
                        8,
                        { isFilled: true },
                    );
                renderEntity.restore();
                renderEntity.save();
                    renderEntity.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
                        ent.position.x * renderEntity.tw + frameWidth / 2,
                        ent.position.y * renderEntity.th - renderEntity.th / 2,
                        7,
                        0,
                        prog * Math.PI * 2,
                        { isFilled: true, counterClockwise: true },
                    );
                renderEntity.restore();
                
                //? Draw Health bar
                let hp = `rgba(95, 160, 80, 0.75)`;
                if(ent.health.value.rate <= 0.3) {
                    hp = `rgba(196, 74, 74, 0.75)`;
                } else if(ent.health.value.rate <= 0.6) {
                    hp = `rgba(201, 199, 72, 0.75)`;
                }
                renderEntity.save();
                    renderEntity.prop({ fillStyle: `rgba(0, 0, 0, 0.35)`, strokeStyle: `rgba(0, 0, 0, 0.35)` }).rect(
                        ent.position.x * renderEntity.tw,
                        ent.position.y * renderEntity.th - renderEntity.th / 4 + 2,
                        frameWidth,
                        5,
                        { isFilled: true },
                    );
                    renderEntity.prop({ fillStyle: hp }).rect(
                        ent.position.x * renderEntity.tw + 1,
                        ent.position.y * renderEntity.th - renderEntity.th / 4 + 2 + 1,
                        ent.health.value.rate * (frameWidth - 2),
                        3,
                        { isFilled: true },
                    );
                renderEntity.restore();
            }
        }
        

        renderEntity.save();
            const player = game.world.entities.player;
            const path = player.movement.path || [];
            const [ x, y ] = player.movement.destination || [];

            for(let [ tx, ty ] of path) {
                renderEntity.prop({ fillStyle: `rgba(0, 0, 0, 0.1)` }).tRect(
                    tx,
                    ty,
                    1,
                    1,
                    { isFilled: true },
                );
            }
            
            if(!(player.position.x === x && player.position.y === y)) {
                renderEntity.prop({ fillStyle: `rgba(255, 0, 0, 0.2)` }).tRect(
                    x,
                    y,
                    1,
                    1,
                    { isFilled: true },
                );
            }
        renderEntity.restore();
    }

    return renderEntity;
}

export default {
    load,
    init,
};