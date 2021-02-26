/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import GameLoop from "./GameLoop";
import TileCanvas from "./TileCanvas";

export default class Game extends Agency.Observable {
    constructor({ fps = 2 } = {}) {
        super(false);
        
        this._lastUpdate = 0;
        
        this.loop = new GameLoop(fps, this.onTick);
        this.canvas = new TileCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } });

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
    }

    onTick(dt, now) {
        this._lastUpdate = now;
    }

    // Access Singleton pattern via Game.$
    static get $() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            
            Game.$.canvas._config.clearBeforeDraw = true;
            Game.$.canvas.onDraw = () => {
                Game.$.canvas.gRect(Agency.Util.Dice.d25(1, -1), Agency.Util.Dice.d25(1, -1), 1, 1, { isFilled: true });
            }
            Game.$.loop.start();
        }

        return Game.Instance;
    }
}