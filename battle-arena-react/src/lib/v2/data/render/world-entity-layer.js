import SpriteStack from "../../util/render/SpriteStack";
import { hasTurn } from "../entity/components/turn";

export function comparator(data = {}, oldData = {}) {
    return data.hash !== oldData.hash
        || !(data.x === oldData.x && data.y === oldData.y);
}

// export async function drawLayer(dt, elapsed, entity) {
//     const prog = ((Date.now() - entity.turn.timeout) % this.game.config.GCD) / this.game.config.GCD;      // % this.game.config.GCD hides information and should only be used for testing
            
//     //STUB  Dynamically add <Sprite(s)> // const sprite = new SpriteStack([ this.sprite({ entity: entity }), this.sprite({ entity: this.game.world.current.entities[ `player` ] }) ]);
//     const spriteSheet = this.game.render.sprite("entity", { entity: entity });

//     if (spriteSheet) {
//         // const [ hash, [ canvas, x, y, w, h ]] = spriteSheet.get(elapsed);
//         // const newData = { hash, x: entity.position.x, y: entity.position.y }

//         // if(this.check(entity, newData)) {
//         //     const oldData = this.get(entity);
            
//         //     this.erase(oldData.x * this.tw, oldData.y * this.th, w, h);
//         //     this.set(entity, newData);

//         //     spriteSheet.paint(0, elapsed, this.canvas, entity.position.x * this.tw, entity.position.y * this.th);
//         // }
        
//         spriteSheet.paint(0, elapsed, this.canvas, entity.position.x * this.tw, entity.position.y * this.th);

//         if(this.game.config.SHOW_UI) {
//             let frameWidth = this.tw;
            
//             // //? Draw Pie Timer
//             let color = `rgba(95, 160, 80, 0.75)`;
//             if(prog >= 0.80) {
//                 color = `rgba(196, 74, 74, 0.75)`;
//             } else if(prog >= 0.55) {
//                 color = `rgba(201, 199, 72, 0.75)`;
//             }
//             this.save();
//                 this.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
//                     entity.position.x * this.tw + frameWidth / 2,
//                     entity.position.y * this.th - this.th / 2,
//                     6,
//                     { isFilled: true },
//                 );
//             this.restore();
//             this.save();
//                 this.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
//                     entity.position.x * this.tw + frameWidth / 2,
//                     entity.position.y * this.th - this.th / 2,
//                     5,
//                     0,
//                     prog * Math.PI * 2,
//                     { isFilled: true, counterClockwise: true },
//                 );
//             this.restore();
            
//             // //? Draw Health bar
//             let hp = `rgba(95, 160, 80, 0.75)`;
//             if(entity.health.value.rate <= 0.3) {
//                 hp = `rgba(196, 74, 74, 0.75)`;
//             } else if(entity.health.value.rate <= 0.6) {
//                 hp = `rgba(201, 199, 72, 0.75)`;
//             }
//             this.save();
//                 this.prop({ fillStyle: `rgba(0, 0, 0, 0.35)`, strokeStyle: `rgba(0, 0, 0, 0.35)` }).rect(
//                     entity.position.x * this.tw,
//                     entity.position.y * this.th - this.th / 4 + 2,
//                     frameWidth,
//                     5,
//                     { isFilled: true },
//                 );
//                 this.prop({ fillStyle: hp }).rect(
//                     entity.position.x * this.tw + 1,
//                     entity.position.y * this.th - this.th / 4 + 2 + 1,
//                     entity.health.value.rate * (frameWidth - 2),
//                     3,
//                     { isFilled: true },
//                 );
//             this.restore();
//         }
//     }
// };

export async function drawAnimationFrame(dt, elapsed) {
    //STUB  This should be performed at the <RenderManager> response to a <World> swap
    [ this.width, this.height ] = [ this.game.render.width, this.game.render.height ];

    for(let entity of this.game.world.current.entities.values) {
        drawAnimationFrameEntity.call(this, dt, elapsed, entity);
    }

    this.__hooks.forEach(fn => fn.call(this, dt, elapsed));

    return this;
};
export async function drawAnimationFrameEntity(dt, elapsed, entity) {
    //STUB  Dynamically add <Sprite(s)> // const sprite = new SpriteStack([ this.sprite({ entity: entity }), this.sprite({ entity: this.game.world.current.entities[ `player` ] }) ]);
    const spriteSheet = this.game.render.sprite("entity", { entity: entity });

    if (spriteSheet) {        
        spriteSheet.paint(0, elapsed, this.canvas, entity.position.x * this.tw, entity.position.y * this.th);

        if(!hasTurn(entity)) {
            return;
        }

        const prog = ((Date.now() - entity.turn.timeout) % this.game.config.GCD) / this.game.config.GCD;      // % this.game.config.GCD hides information and should only be used for testing
            
        if(this.game.config.SHOW_UI) {
            let frameWidth = this.tw;
            
            // //? Draw Pie Timer
            let color = `rgba(95, 160, 80, 0.75)`;
            if(prog >= 0.80) {
                color = `rgba(196, 74, 74, 0.75)`;
            } else if(prog >= 0.55) {
                color = `rgba(201, 199, 72, 0.75)`;
            }
            this.save();
                this.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
                    entity.position.x * this.tw + frameWidth / 2,
                    entity.position.y * this.th - this.th / 2,
                    6,
                    { isFilled: true },
                );
            this.restore();
            this.save();
                this.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
                    entity.position.x * this.tw + frameWidth / 2,
                    entity.position.y * this.th - this.th / 2,
                    5,
                    0,
                    prog * Math.PI * 2,
                    { isFilled: true, counterClockwise: true },
                );
            this.restore();
            
            // //? Draw Health bar
            let hp = `rgba(95, 160, 80, 0.75)`;
            if(entity.health.value.rate <= 0.3) {
                hp = `rgba(196, 74, 74, 0.75)`;
            } else if(entity.health.value.rate <= 0.6) {
                hp = `rgba(201, 199, 72, 0.75)`;
            }
            this.save();
                this.prop({ fillStyle: `rgba(0, 0, 0, 0.35)`, strokeStyle: `rgba(0, 0, 0, 0.35)` }).rect(
                    entity.position.x * this.tw,
                    entity.position.y * this.th - this.th / 4 + 2,
                    frameWidth,
                    5,
                    { isFilled: true },
                );
                this.prop({ fillStyle: hp }).rect(
                    entity.position.x * this.tw + 1,
                    entity.position.y * this.th - this.th / 4 + 2 + 1,
                    entity.health.value.rate * (frameWidth - 2),
                    3,
                    { isFilled: true },
                );
            this.restore();
        }
    }
};

export default drawAnimationFrame;