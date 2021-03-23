import { DictTerrain } from "../entity/components/terrain";

export function comparator(data = {}, oldData = {}) {
    return data.hash !== oldData.hash;
}

// export async function drawLayer(dt, elapsed, terrain) {            
//     const spriteSheet = this.game.render.sprite("terrain", { entity: terrain });

//     if(spriteSheet) {
//         const [[ hash, [ canvas, x, y, w, h ]]] = spriteSheet.get(elapsed);
//         const newData = { hash, x: terrain.position.x, y: terrain.position.y }

//         if(this.check(terrain, newData)) {
//             const oldData = this.get(terrain);
            
//             this.erase(oldData.x * this.tw, oldData.y * this.th, w, h);
//             this.set(terrain, newData);

//             spriteSheet.paint(0, elapsed, this.canvas, terrain.position.x * this.tw, terrain.position.y * this.th);

//             //STUB  Edge system has to be overhauled, but this is the general application principle
//             if(terrain.terrain.type === DictTerrain.DIRT.type) {
//                 this.image(spriteSheet.entries[ 1 ].get(terrain.terrain.edges), terrain.position.x * this.tw, terrain.position.y * this.th);
//             }
//         }
//     }
// };

export async function onDraw(dt, elapsed) {
    // console.log(dt, elapsed)
    for(let entity of this.game.world.current.terrain.values) {
        drawLayer.call(this, dt, elapsed, entity);
    }

    this.__hooks.forEach(fn => fn.call(this, dt, elapsed));

    return this;
};
export async function drawLayer(dt, elapsed, terrain) {            
    const spriteSheet = this.game.render.sprite("terrain", { entity: terrain });

    if(spriteSheet) {
        spriteSheet.paint(0, elapsed, this.canvas, terrain.position.x * this.tw, terrain.position.y * this.th);
    }
};

export default drawLayer;