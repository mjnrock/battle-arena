import SpriteStack from "../../util/render/SpriteStack";

export function comparator(data = {}, oldData = {}) {
    return data.hash !== oldData.hash
        || !(data.x === oldData.x && data.y === oldData.y);
}

export async function drawLayer(dt, elapsed, entity) {
    const prog = ((Date.now() - entity.turn.timeoutStart) % this.game.config.GCD) / this.game.config.GCD;      // % this.game.config.GCD hides information and should only be used for testing
            
    //STUB  Dynamically add <Sprite(s)> // const sprite = new SpriteStack([ this.sprite({ entity: entity }), this.sprite({ entity: this.game.world.entities[ `player` ] }) ]);
    const sprite = this.game.render.sprite("entity", { entity: entity });

    if (sprite) {
        const [ hash, [ canvas, x, y, w, h ]] = sprite.get(elapsed);
        const newData = { hash, x: entity.position.x, y: entity.position.y }

        if(this.check(entity, newData)) {
            const oldData = this.get(entity);
            
            this.erase(oldData.x * this.tw, oldData.y * this.th, w, h);
            this.set(entity, newData);

            sprite.paint(0, elapsed, this.canvas, entity.position.x * this.tw, entity.position.y * this.th);
        }

        // let frameWidth = canvas.width;
        
        // //? Draw Pie Timer
        // let color = `rgba(95, 160, 80, 0.75)`;
        // if(prog >= 0.80) {
        //     color = `rgba(196, 74, 74, 0.75)`;
        // } else if(prog >= 0.55) {
        //     color = `rgba(201, 199, 72, 0.75)`;
        // }
        // this.save();
        //     this.prop({ fillStyle: `rgba(0, 0, 0, 0.15)`, strokeStyle: "transparent" }).circle(
        //         entity.position.x * this.tw + frameWidth / 2,
        //         entity.position.y * this.th - this.th / 2,
        //         8,
        //         { isFilled: true },
        //     );
        // this.restore();
        // this.save();
        //     this.prop({ fillStyle: color, strokeStyle: `rgba(0, 0, 0, 0.35)` }).pie(
        //         entity.position.x * this.tw + frameWidth / 2,
        //         entity.position.y * this.th - this.th / 2,
        //         7,
        //         0,
        //         prog * Math.PI * 2,
        //         { isFilled: true, counterClockwise: true },
        //     );
        // this.restore();
        
        // //? Draw Health bar
        // let hp = `rgba(95, 160, 80, 0.75)`;
        // if(entity.health.value.rate <= 0.3) {
        //     hp = `rgba(196, 74, 74, 0.75)`;
        // } else if(entity.health.value.rate <= 0.6) {
        //     hp = `rgba(201, 199, 72, 0.75)`;
        // }
        // this.save();
        //     this.prop({ fillStyle: `rgba(0, 0, 0, 0.35)`, strokeStyle: `rgba(0, 0, 0, 0.35)` }).rect(
        //         entity.position.x * this.tw,
        //         entity.position.y * this.th - this.th / 4 + 2,
        //         frameWidth,
        //         5,
        //         { isFilled: true },
        //     );
        //     this.prop({ fillStyle: hp }).rect(
        //         entity.position.x * this.tw + 1,
        //         entity.position.y * this.th - this.th / 4 + 2 + 1,
        //         entity.health.value.rate * (frameWidth - 2),
        //         3,
        //         { isFilled: true },
        //     );
        // this.restore();

        // if(entity === this.game.world.entities.player) {                    
        //     this.save();
        //     const player = this.game.world.entities.player;
        //     const path = player.movement.path || [];
        //     const [ x, y ] = player.movement.destination || [];

        //     for(let [ tx, ty ] of path) {
        //         this.prop({ fillStyle: `rgba(0, 0, 0, 0.1)` }).tRect(
        //             tx,
        //             ty,
        //             1,
        //             1,
        //             { isFilled: true },
        //         );
        //     }
            
        //     if(!(player.position.x === x && player.position.y === y)) {
        //         this.prop({ fillStyle: `rgba(255, 0, 0, 0.2)` }).tRect(
        //             x,
        //             y,
        //             1,
        //             1,
        //             { isFilled: true },
        //         );
        //     }
        //     this.restore();
        // }
    }
};

export default drawLayer;