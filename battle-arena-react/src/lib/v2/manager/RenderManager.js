import Agency from "@lespantsfancy/agency";
import LayeredCanvas from "./../util/render/LayeredCanvas";

import RenderGroup from "../util/render/RenderGroup";
import ImageRegistry, { EntityTemplate, TerrainTemplate } from "../util/render/ImageRegistry";

import { TerrainLookup } from "./../data/entity/components/terrain";

export class RenderManager extends LayeredCanvas {
    constructor(width, height, groups = []) {
        super({ width, height });

        this.repository = new Agency.Util.CrossMap([
            [
                "entity",
                "terrain",
            ],
        ], {
            seedFn: (chain) => {
                switch(chain) {
                    case "entity":
                        return new ImageRegistry(EntityTemplate, {
                            lookupFns: [
                                ({ entity }) => "bunny",
                                ({ entity }) => 0,
                                ({ entity }) => Math.floor(entity.position.facing / 90) * 90,
                            ]
                        });
                    case "terrain":
                        return new ImageRegistry(TerrainTemplate, {
                            lookupFns: [
                                ({ entity }) => TerrainLookup(entity.terrain.type),
                                ({ entity }) => 0,
                                ({ entity }) => Math.floor(entity.position.facing / 90) * 90,
                            ]
                        });
                    default:
                        return null;
                }
            }
        });

        for(let group of groups) {
            this.addGroup(group);
        }
    }

    addGroup(group) {
        if(group instanceof RenderGroup) {
            this.addLayer(group);
        }
    }

    sprite(root, ...coords) {
        const repo = this.repository.get(root);

        if(repo instanceof ImageRegistry) {
            return repo.get(...coords);
        }
    }
}

export default RenderManager;