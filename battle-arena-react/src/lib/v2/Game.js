/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./TileCanvas";

export default class Game extends Agency.Observable {
    constructor({ fps = 2 } = {}) {
        super(false);
        
        this._lastUpdate = 0;
        
        this.loop = Agency.Pulse.Generate(fps, { autostart: false }, ({ now }) => {
            console.log(now);
            this._lastUpdate = now;
        });
        this.canvas = new TileCanvas(25, 25, { width: 1000, height: 800, props: { fillStyle: "rgba(0, 0, 255, 1.0)", strokeStyle: "#000" } });

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
    }

    // Access Singleton pattern via Game.$
    static get $() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            
            Game.$.canvas.eraseFirst();
            Game.$.canvas.onDraw = () => {
                Game.$.canvas.drawGrid();
                Game.$.canvas.tRect(
                    Agency.Util.Dice.random(0, Game.$.canvas.rows),
                    Agency.Util.Dice.random(0, Game.$.canvas.cols),
                    1, 1, { isFilled: true }
                );
            }
            Game.$.loop.subject.start();
        }

        return Game.Instance;
    }
}