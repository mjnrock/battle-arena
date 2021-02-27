/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./TileCanvas";

export default class Game extends Agency.Beacon {
    constructor({ fps = 2 } = {}) {
        super(false);
        
        this.loop = Agency.Pulse.Generate(fps, { autostart: false });
        this.render = null;

        this.canvas = new TileCanvas(25, 25, { width: 800, height: 600, props: { fillStyle: "rgba(0, 0, 255, 1.0)", strokeStyle: "#000" } });

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
        
        this.attach(this.loop);
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