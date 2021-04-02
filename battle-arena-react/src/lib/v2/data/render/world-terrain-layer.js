// import { DictTerrain } from "../entity/components/terrain";
import { DictTerrain } from "./../../entity/component/Terrain";

export function comparator(data = {}, oldData = {}) {
    return data.hash !== oldData.hash;
}

export async function drawAnimationFrame(dt, now) {
    //FIXME  Don't bother updating terrain canvas (after initial draws) until this is substantially more optimized
    if(now - this.game.loop.__start < 1000) {
        //STUB  This should be performed at the <RenderManager> response to a <World> swap
        [ this.width, this.height ] = [ this.game.render.width, this.game.render.height ];
        
        for(let node of this.game.world.current) {
            drawAnimationFrameEntity.call(this, dt, now, node);
        }
    }

    this.__hooks.forEach(fn => fn.call(this, dt, now));

    return this;
};
export async function drawAnimationFrameEntity(dt, now, node) {
    const terrain = node.terrain;
    const spriteSheet = this.game.render.sprite("terrain", { entity: terrain });

    if(spriteSheet) {
        spriteSheet.paint(0, now, this.canvas, terrain.world.x * this.tw, terrain.world.y * this.th);
        
        //STUB  Draw dirt edges
        if(terrain.terrain.type === DictTerrain.DIRT.type) {
            this.image(spriteSheet.entries[ 1 ].get(terrain.terrain.edges), terrain.world.x * this.tw, terrain.world.y * this.th);
        }
    }

    if(node.hasPortals) {
        this.prop({ fillStyle: `rgba(155, 0, 155, 0.25` }).tRect(
            terrain.world.x,
            terrain.world.y,
            1,
            1,
            { isFilled: true },
        );
    }
        
    const wear = Math.min(node.frequency / 1000.0, 0.33);
    this.prop({ fillStyle: `rgba(74, 46, 10, ${ wear }` }).tRect(
        terrain.world.x,
        terrain.world.y,
        1,
        1,
        { isFilled: true },
    );
};
// export async function drawAnimationFrameEntity(dt, elapsed, terrain) {
//     const spriteSheet = this.game.render.sprite("terrain", { entity: terrain });

//     if(spriteSheet) {
//         const [[ hash, [ canvas, x, y, w, h ]]] = spriteSheet.get(elapsed);
//         const newData = { hash, x: terrain.world.x, y: terrain.world.y }

//         if(this.check(terrain, newData)) {
//             const oldData = this.get(terrain);
            
//             this.erase(oldData.x * this.tw, oldData.y * this.th, w, h);
//             this.set(terrain, newData);

//             spriteSheet.paint(0, elapsed, this.canvas, terrain.world.x * this.tw, terrain.world.y * this.th);

//             //STUB  Edge system has to be overhauled, but this is the general application principle
//             if(terrain.terrain.type === DictTerrain.DIRT.type) {
//                 this.image(spriteSheet.entries[ 1 ].get(terrain.terrain.edges), terrain.world.x * this.tw, terrain.world.y * this.th);
//             }
//         }
//     }
// };

export default drawAnimationFrame;