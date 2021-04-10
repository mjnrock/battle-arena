export async function init(game) {
    window.onkeypress = e => {
        e.preventDefault();

        //STUB  These "DigitX" invocations need to be moved somewhere else.
        //FIXME Range check is not robust
        //FIXME An ability like "holyLight" with Affliction.Current would hit multiple entities if they were stacked.  Add some "Max Entities" limiter and maybe an <Effect> hit accumulator?
        if(e.code === "Digit1") {
            const [ first ] = Object.values(game.players.player.action.abilities);

            if(first) {
                const ability = first();
                ability.invoke(game.players.player, {
                    ...game.players.player.world.pos(),
                });
            }
        } else if(e.code === "Digit2") {
            const [ ,second ] = Object.values(game.players.player.action.abilities);

            if(second) {
                const ability = second();

                let [ mx, my ] = game.config.MOUSE_POSITION;
                let [ px, py ] = game.players.player.world.pos(true);
                px = ~~px;
                py = ~~py;

                let x, y;
                
                const world = game.players.player.world.getCurrentWorld();
                const node = world.node(mx, my);

                if(node.hasOccupants && (Math.abs(mx - px) + Math.abs(my - py)) <= ability.range) {
                    [ x, y ] = [ node.x, node.y ];
                } else {
                    [ x, y ] = [ px, py ];
                }
                
                ability.invoke(game.players.player, { x, y });
            }
        } else if(e.code === "KeyV") {
            game.config.SHOW_UI = !game.config.SHOW_UI;
        } else if(e.code === "Space") {
            game.players.player.action.interact();
        }
    };
}

export default init;