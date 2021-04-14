/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import RenderManager from "./manager/RenderManager";
import GameLoop from "./GameLoop";

import Lib from "./package";

import ChannelManager from "./manager/ChannelManager";
import EntityManager from "./manager/EntityManager";
import TurnManager from "./manager/TurnManager";

export default class Game extends Agency.Context {
    constructor({ fps = 24 } = {}) {
        super({
            loop: new GameLoop(fps),
            turn: new TurnManager(),
            entities: new EntityManager(),
            canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } }),
            channel: new ChannelManager(),
            render: new RenderManager(),
        });

        
        this.channel.addGame(this);
        this.render.addGame(this);
        this.entities.addGame(this);
        this.turn.addGame(this);

        // Create Singleton pattern
        if(!Game.Instance) {
            Game.Instance = this;
        }
    }

    // Access Singleton pattern via Game.$
    static get $() {
        if(!Game.Instance) {
            Game.Instance = new Game();
            
            Game.$.canvas._config.clearBeforeDraw = true;
            Game.$.loop.start();
        }

        return Game.Instance;
    }
}