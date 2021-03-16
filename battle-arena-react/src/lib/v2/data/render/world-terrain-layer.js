import Agency from "@lespantsfancy/agency";

export function comparator(data = {}, oldData = {}) {
    return data.hash !== oldData.hash;
    return !(data.x === oldData.x && data.y === oldData.y);
}

export async function drawLayer(dt, elapsed, terrain) {            
    const sprite = this.game.render.sprite("terrain", { entity: terrain });

    if(sprite) {
        const [[ hash, [ canvas, x, y, w, h ]]] = sprite.get(elapsed);
        const newData = { hash, x: terrain.position.x, y: terrain.position.y }

        if(this.check(terrain, newData)) {
            const oldData = this.get(terrain);
            
            this.erase(oldData.x * this.tw, oldData.y * this.th, w, h);
            this.set(terrain, newData);

            sprite.paint(0, elapsed, this.canvas, terrain.position.x * this.tw, terrain.position.y * this.th);


            if(terrain.terrain.type === 2) {
                console.log(sprite.sprites[ 1 ], [ terrain.terrain.edges ], terrain.position.x * this.tw, terrain.position.y * this.th)
                // this.image(sprite.sprites[ 1 ][ terrain.terrain.edges ], terrain.position.x * this.tw, terrain.position.y * this.th);
            }
        }
    }
};

export default drawLayer;