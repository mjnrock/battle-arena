import Path from "./../../util/Path";

export function consoleEntityList(entities, ...focus) {
    let condition = (key, entity) => focus.includes(key);

    for(let entity of entities) {
        console.group(entity.id);
        // console.groupCollapsed(entity.id);

        for(let key in entity) {
            if(condition(key, entity)) {
                console.group(key);
            } else {
                console.groupCollapsed(key);
            }

            console.table(Object.assign({}, entity[ key ]), [ "Value" ]);
            console.groupEnd();
        }
        console.groupEnd();
    }
}

export async function init(game) {
    game.render.handler.addSubscriber(function(e) {
        const { target: canvas, button, clientX: x, clientY: y } = e;

        const { left, top } = canvas.getBoundingClientRect();
        const pos = {
            px: x - left,
            py: y - top,
        };
        pos.tx = pos.px / game.config.render.tile.width;
        pos.ty = pos.py / game.config.render.tile.height;
        pos.txi = Math.floor(pos.tx);
        pos.tyi = Math.floor(pos.ty);

        if(this.type === "contextmenu") {
            e.preventDefault();
        } else if(this.type === "mouseup") {
            if(button === 0) {
                // console.info(pos.txi, pos.tyi, JSON.stringify(game.world.current.getTerrain(pos.txi, pos.tyi).terrain.toData()));
                const occupants = game.world.current.node(pos.txi, pos.tyi).occupants;

                console.info(`${ occupants.size } @ [${ pos.txi },${ pos.tyi }]`);
                consoleEntityList(occupants, "world");
            } else if(button === 2) {
                const player = game.players.player;

                if(e.shiftKey) {
                    player.world.wayfinder.waypoint(game.world.current, pos.txi, pos.tyi);
                } else {
                    const path = Path.FindPath(game.world.current, [ player.world.x, player.world.y ], [ pos.txi, pos.tyi ]);
                    player.world.wayfinder.set(path);
                }
            }
        } else if(this.type === "mousemove") {
            game.config.MOUSE_POSITION = [ pos.txi, pos.tyi ];
        }
    });
}

export default init;