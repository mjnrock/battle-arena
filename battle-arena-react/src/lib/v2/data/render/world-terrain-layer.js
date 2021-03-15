import RenderGroup from "../../util/render/RenderGroup";

export async function init(game) {
    const renderTerrain = new RenderGroup(game.world.terrain);

    // const dirs = [
    //     [ 0, -1, 0 ],
    //     [ 1, 0, 90 ],
    //     [ 0, 1, 180 ],
    //     [ -1, 0, 270 ],

    //     [ -1, -1, 0 ],
    //     [ 1, -1, 90 ],
    //     [ 1, 1, 180 ],
    //     [ -1, 1, 270 ],
    // ];

    renderTerrain.eraseFirst();
    renderTerrain.onDraw = (dt, elapsed) => {
        if (renderTerrain.canvas.width !== game.render.width || renderTerrain.canvas.height !== game.render.height) {
            renderTerrain.canvas.width = game.render.width;
            renderTerrain.canvas.height = game.render.height;
        }

        for (let terrain of renderTerrain.entities) {
            const sprite = game.render.sprite("terrain", { entity: terrain });

            if (sprite) {
                sprite.paint(elapsed, renderTerrain, terrain.position.x * renderTerrain.tw, terrain.position.y * renderTerrain.th);
            }
        }
    }

    return renderTerrain;
}

export default init;