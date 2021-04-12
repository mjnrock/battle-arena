import Agency from "@lespantsfancy/agency";
import { validate } from "uuid";

export async function init(game) {
    window.onkeydown = e => {
        e.preventDefault();

        //FIXME  These "DigitX" invocations need to be generalized and handled via the <Network> event system.
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
                
                // ability.invoke(game.players.player, { x: px, y: py });
                ability.invoke(game.players.player, { x: mx, y: my });
            }
        } else if(e.code === "F5") {
            if(e.ctrlKey) {
                window.location.replace(window.location.href);
            } else {
                window.location.reload();
            }
        } else if(e.code === "F3") {
            if(!game.config.SHOW_UI) {
                game.config.SHOW_DEBUG = true;
            } else {
                game.config.SHOW_DEBUG = !game.config.SHOW_DEBUG;
            }
            game.config.SHOW_UI = true;
        } else if(e.code === "F2") {
            if(e.ctrlKey) {
                game.config.SHOW_HEATMAP = !game.config.SHOW_HEATMAP;
            }
            game.config.SHOW_WEAR = !game.config.SHOW_WEAR;
        } else if(e.code === "KeyV") {
            game.config.SHOW_UI = !game.config.SHOW_UI;
        } else if(e.code === "Space") {
            game.players.player.action.interact();
        } else if(e.code === "Delete") {
            if(e.ctrlKey) {
                console.clear();
            }
        }  else if(e.code === "F1") {
            console.clear();
            console.group(`Debugging`);
                console.group(`Agency Network`);
                    const DefaultNetwork = Agency.Event.Network.$;
                    let entries = [];
                    console.log(`Network Size:`, DefaultNetwork.size)
                    for(let key of Reflect.ownKeys(DefaultNetwork)) {
                        if(!validate(key)) {
                            entries.push({ key, value: DefaultNetwork[ key ] });
                        }
                    }
                    console.table(entries);
                console.groupEnd();
            console.groupEnd();
        } 
    };
}

export default init;