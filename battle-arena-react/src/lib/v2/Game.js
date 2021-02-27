/* eslint-disable */
import Agency from "@lespantsfancy/agency";

import TileCanvas from "./TileCanvas";

//STUB Imports for stub below
import Component from "./Component";
import Entity from "./Entity";
import Action from "./Action";
import World from "./World";

import componentPosition from "./data/entity/components/position";

import filterProximity from "./data/entity/filters/proximity";
import effectMove from "./data/entity/effects/move";
//STUB  END IMPORTS

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

            //STUB  Any random stuff to try out on load
            const entity = new Entity();
            const component = Component.FromSchema(componentPosition, 4, 7);
            entity.position = component;

            setInterval(() => {
                // effectMove.Random(null, entity, Game.$.canvas.cols, Game.$.canvas.rows);
                const action = new Action(filterProximity.Range, effectMove.Random);
                action.perform({
                    [ entity.__id ]: entity,
                }, [
                    entity.position.x,
                    entity.position.y,
                    2,
                ], [
                    entity,
                    Game.$.canvas.cols,
                    Game.$.canvas.rows,
                ]);
                // action.perform([
                //     entity,
                // ], [
                //     entity.position.x,
                //     entity.position.y,
                //     2,
                // ], [
                //     entity,
                //     Game.$.canvas.cols,
                //     Game.$.canvas.rows,
                // ]);
            }, 750);
            
            Game.$.canvas.eraseFirst();
            Game.$.canvas.onDraw = () => {
                Game.$.canvas.drawGrid();
                Game.$.canvas.tRect(
                    entity.position.x,
                    entity.position.y,
                    1, 1, { isFilled: true }
                );
            }
            Game.$.loop.subject.start();
        }

        return Game.Instance;
    }
}