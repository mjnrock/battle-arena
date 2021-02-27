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
            Game.Instance.world = new World(25, 25);

            const entity = new Entity();
            const component = Component.FromSchema(componentPosition, 4, 7);
            entity.position = component;            
            Game.Instance.world.join(entity, "player");

            const e2 = new Entity();
            const c2 = Component.FromSchema(componentPosition, 4, 7);
            e2.position = c2;            
            Game.Instance.world.join(e2);

            Game.Instance.canvas = new TileCanvas(
                600 / Game.Instance.world.width,
                600 / Game.Instance.world.height,
                { width: 600, height: 600, props: { fillStyle: "rgba(0, 0, 255, 1.0)", strokeStyle: "#000" }
            });

            setInterval(() => {
                const entities = Game.$.world.entities.values;

                Action.Spawn(
                    entity,
                    filterProximity.Range(entity.position.x, entity.position.y, 0),
                    effectMove.Random(Game.$.canvas.cols, Game.$.canvas.rows),
                    entities,
                );
            }, 750);
            
            Game.Instance.canvas.eraseFirst();
            Game.Instance.canvas.onDraw = () => {
                Game.Instance.canvas.drawGrid();

                for(let ent of Game.$.world.entities.values) {
                    Game.Instance.canvas.tRect(
                        ent.position.x,
                        ent.position.y,
                        1, 1, { isFilled: true }
                    );
                }
            }
            Game.Instance.loop.subject.start();
        }

        return Game.Instance;
    }
}