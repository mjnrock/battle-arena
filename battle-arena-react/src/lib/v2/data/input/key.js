export async function init(game) {
    window.onkeypress = e => {
        e.preventDefault();

        if(e.code === "KeyV") {
            game.config.SHOW_UI = !game.config.SHOW_UI;
        } else if(e.code === "Space") {
            game.players.player.action.interact();
        }
    };
}

export default init;