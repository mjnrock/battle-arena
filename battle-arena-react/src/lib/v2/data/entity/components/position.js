import World from "../../../World";

//! Component Schemas should always be functions
const _name = "position";

export const schema = {
    [ _name ]: ({ x, y, facing = 0, world, ...rest } = {}) => ({
        world: world instanceof World ? world.id : world,
        facing,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        
        nudge: (game, entity, dx, dy) => {
            entity.position.x += dx;
            entity.position.y += dy;
        },
        move: (game, entity, nx, ny) => {
            entity.position.x = nx;
            entity.position.y = ny;
        },
        accelerate: (game, entity, vx, vy) => {
            entity.position.vx = vx;
            entity.position.vy = vy;
        },
        wayfind: (game, entity) => {                        
            if(!entity.movement.wayfinder.hasPath && Agency.Util.Dice.percento(0.10)) {
                const [ tx, ty ] = [ Agency.Util.Dice.random(0, world.width - 1), Agency.Util.Dice.random(0, world.height - 1) ];
                const path = Path.FindPath(world, [ entity.position.x, entity.position.y ], [ tx, ty ]);

                entity.movement.wayfinder.set(path);
            } else if(entity.movement.wayfinder.hasPath ) {
                if(entity.movement.wayfinder.isCurrentDestination(entity.position)) {
                    const [ tx, ty ] = [ Agency.Util.Dice.random(0, world.width - 1), Agency.Util.Dice.random(0, world.height - 1) ];
                    const path = Path.FindPath(world, [ entity.position.x, entity.position.y ], [ tx, ty ]);
    
                    entity.movement.wayfinder.set(path);
                }
            }
        },
        
        ...rest,
    }),
};

export function hasPosition(entity = {}) {
    return _name in entity;
}

export default schema;