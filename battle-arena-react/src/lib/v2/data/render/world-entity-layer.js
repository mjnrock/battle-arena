import Agency from "@lespantsfancy/agency";

import RenderGroup from "./../../util/render/RenderGroup";
import { EntityTemplate as EntityImageRegistryTemplate } from "../../util/render/ImageRegistry";
import { ToCanvasMap } from "../image/tessellator/grid";

export async function load(game, renderGroup) {
    //NOTE  If you want to add more files, they MUST have a corresponding "1st dimension" key in renderGroup (cf. ImageRegistry.EntityTemplate)
    let files = [
        `squirrel`,
        `bunny`,
        `ghost-squirrel2`,
        // `ghost-bunny`,
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
                .catch(e => console.error(`[Tessellation Failed]:  Ensure "${ file }" is present in the WorldEntityLayer <ImageRegistry> dimensional key range.  No <Sprite> was added to the registry.`))
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

    await load(game, renderEntity);

    renderEntity.eraseFirst();
    renderEntity.onDraw = (dt, elapsed) => {
        if(renderEntity.canvas.width !== game.render.width || renderEntity.canvas.height !== game.render.height) {
            renderEntity.canvas.width = game.render.width;
            renderEntity.canvas.height = game.render.height;
        }

        for(let ent of renderEntity.entities) {
            const prog = ((Date.now() - ent.turn.timeoutStart) % game.config.GCD) / game.config.GCD;      // % game.config.GCD hides information and should only be used for testing
            const sprite = renderEntity.sprite({ entity: ent });

            if(sprite) {
                renderEntity.image(
                    sprite.get(elapsed),
                    0,
                    0,
                    renderEntity.tw,
                    renderEntity.th,
                    ent.position.x * renderEntity.tw,
                    ent.position.y * renderEntity.th,
                    renderEntity.tw,
                    renderEntity.th,
                );
                
                //? Draw Pie Timer
                let color = `rgba(95, 160, 80, 0.75)`;
                if(prog >= 0.80) {
                    color = `rgba(196, 74, 74, 0.75)`;
                } else if(prog >= 0.55) {
                    color = `rgba(201, 199, 72, 0.75)`;
                }
                renderEntity.save();
                    renderEntity.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
                        ent.position.x * renderEntity.tw + renderEntity.tw / 2,
                        ent.position.y * renderEntity.th - renderEntity.tw / 2,
                        8,
                        { isFilled: true },
                    );
                renderEntity.restore();
                renderEntity.save();
                    renderEntity.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
                        ent.position.x * renderEntity.tw + renderEntity.tw / 2,
                        ent.position.y * renderEntity.th - renderEntity.tw / 2,
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
                        renderEntity.tw,
                        5,
                        { isFilled: true },
                    );
                    renderEntity.prop({ fillStyle: hp }).rect(
                        ent.position.x * renderEntity.tw + 1,
                        ent.position.y * renderEntity.th - renderEntity.th / 4 + 2 + 1,
                        ent.health.value.rate * (renderEntity.tw - 2),
                        3,
                        { isFilled: true },
                    );
                renderEntity.restore();
            }
        }
    }

    return renderEntity;
}

export default {
    load,
    init,
};