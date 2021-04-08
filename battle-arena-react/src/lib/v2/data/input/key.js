export async function init(game) {
    window.onkeypress = e => {
        e.preventDefault();

        if(e.code === "Digit1") {
            const [ first ] = Object.values(game.players.player.action.actions);

            if(first) {
                const action = first();
                action.invoke(game.players.player, {
                    ...game.players.player.world.pos(),
                });
            }
        } else if(e.code === "KeyV") {
            game.config.SHOW_UI = !game.config.SHOW_UI;
        } else if(e.code === "Space") {
            game.players.player.action.interact();
        }
    };
}

export default init;