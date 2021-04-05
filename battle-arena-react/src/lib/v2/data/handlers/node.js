export const handlers = [
    [ "join", (node, entity) => {
        if(node instanceof Node) {
            const { x, y } = node;

            this._cache.set(entity, [ x, y ]);
        }
    }],
    // [ "contact", (actor, target) => {
    //     console.log(actor.meta.type, actor.world.x, actor.world.y, target.meta.type, target.world.x, target.world.y)
    // }],
];

export default handlers;