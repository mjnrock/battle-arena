export async function createLayer(dt, elapsed, terrain) {            
    const sprite = this.game.render.sprite("terrain", { entity: terrain });

    if (sprite) {
        sprite.paint(elapsed, this, terrain.position.x * this.tw, terrain.position.y * this.th);
    }
};

export default createLayer;