import Health from "../../entity/component/Health";
import SpriteStack from "../../render/SpriteStack";
import Action from "./../../entity/component/Action";

export function comparator(data = {}, oldData = {}) {
    return data.hash !== oldData.hash
        || !(data.x === oldData.x && data.y === oldData.y);
}

export async function drawAnimationFrame(dt, now) {
    //STUB  This should be performed at the <RenderManager> response to a <World> swap
    [ this.width, this.height ] = [ this.game.render.width, this.game.render.height ];

    for(let entity of this.game.world.current.entities) {
        drawAnimationFrameEntity.call(this, dt, now, entity);
    }

    this.__hooks.forEach(fn => fn.call(this, dt, now));

    return this;
};
export async function drawAnimationFrameEntity(dt, now, entity) {
    //STUB  Dynamically add <Sprite(s)> // const sprite = new SpriteStack([ this.sprite({ entity: entity }), this.sprite({ entity: this.game.world.current.entities[ `player` ] }) ]);
    const spriteSheet = this.game.render.sprite("entity", { entity: entity });

    if (spriteSheet) {
        let [ frameWidth, frameHeight ] = [ this.tw, this.th ];
        //!GRID-NUDGE
        let [ nudgeX, nudgeY ] = [ -this.tw / 2, -this.th / 2 ];
        // let [ nudgeX, nudgeY ] = [ 0, 0 ];
        const { x, y } = entity.world;

        spriteSheet.paint(0, now, this.canvas, x * frameWidth + nudgeX, y * frameHeight + nudgeY);

        if(!Action.Has(entity)) {
            return;
        }
        
        if(this.game.config.SHOW_UI) {            
            const prog = entity.action.cooldown ? entity.action.cooldown.progress : null;
            if(prog != null && prog <= 1) {
                // //? Draw Pie Timer
                let color = `rgba(95, 160, 80, 0.75)`;
                if(prog >= 0.80) {
                    color = `rgba(196, 74, 74, 0.75)`;
                } else if(prog >= 0.55) {
                    color = `rgba(201, 199, 72, 0.75)`;
                }
                this.save();
                    this.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
                        x * frameWidth + nudgeX + frameWidth / 2,
                        y * frameHeight + nudgeY - frameHeight / 2,
                        6,
                        { isFilled: true },
                    );
                this.restore();
                this.save();
                    this.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
                        x * frameWidth + nudgeX + frameWidth / 2,
                        y * frameHeight + nudgeY - frameHeight / 2,
                        5,
                        0,
                        prog * Math.PI * 2,
                        { isFilled: true, counterClockwise: true },
                    );
                this.restore();
            }
            
            // //? Draw Health bar
            if(Health.Has(entity)) {
                let hp = `rgba(95, 160, 80, 0.75)`;
                if(entity.health.value.rate <= 0.3) {
                    hp = `rgba(196, 74, 74, 0.75)`;
                } else if(entity.health.value.rate <= 0.6) {
                    hp = `rgba(201, 199, 72, 0.75)`;
                }
                this.save();
                    this.prop({ fillStyle: `rgba(0, 0, 0, 0.35)`, strokeStyle: `rgba(0, 0, 0, 0.35)` }).rect(
                        x * frameWidth + nudgeX,
                        y * frameHeight + nudgeY - frameHeight / 4 + 2,
                        frameWidth,
                        5,
                        { isFilled: true },
                    );
                    this.prop({ fillStyle: hp }).rect(
                        x * frameWidth + nudgeX + 1,
                        y * frameHeight + nudgeY - frameHeight / 4 + 2 + 1,
                        entity.health.value.rate * (frameWidth - 2),
                        3,
                        { isFilled: true },
                    );
                this.restore();
            }
        }
    }
};

export default drawAnimationFrame;