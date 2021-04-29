import Agency from "@lespantsfancy/agency";

import GameLoop from "./GameLoop";
import PlayerManager from "./manager/PlayerManager";

export default class Game {
    constructor({ fps = 24 } = {}) {
        this.networks = {
            input: new Agency.Event.Network(),
            world: new Agency.Event.Network(),
            render: new Agency.Event.Network(),
            story: new Agency.Event.Network(),
            server: new Agency.Event.Network(),
            game: new Agency.Event.Network(),
        };

        this.loop = new GameLoop(fps);
        this.players = new PlayerManager();

        this.config = {
            time: {
                GCD: 500,
                interaction: 250,
            },
            render: {
                tile: {
                    width: 32,
                    height: 32,
                },
            },
            SHOW_UI: true,
            SHOW_DEBUG: false,
            SHOW_HEATMAP: false,
            SHOW_WEAR: true,
            MOUSE_POSITION: [ 10, 10 ],
        };

        //FIXME Probably should make this more robust
        window.onfocus = e => this.loop.start();
        window.onblur = e => this.loop.stop();
    }

    get current() {
        return this._current;
    }
    set current(node) {
        if(this.loop.mainLoop.isRunning()) {
            this.loop.stop();
            
            node.attach(this);
    
            this.loop.start();
        } else {
            node.attach(this);
        }

        this._current = node;
    }
}