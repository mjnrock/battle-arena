import Agency from "@lespantsfancy/agency";
import SpriteSheet from "../../util/render/SpriteSheet";

import ImageRegistry, { EntityTemplate, TerrainTemplate } from "./../../util/render/ImageRegistry";

import { TerrainLookup } from "./../entity/components/terrain";

export const repository = (root) => new Agency.Util.CrossMap([
    root || [
        "entity",
        "terrain",
    ],
], {
    seedFn: (chain) => {
        switch(chain) {
            case "entity":
                return new ImageRegistry(EntityTemplate, {
                    seedFn: () => new SpriteSheet(),
                    lookupFns: [
                        ({ entity }) => entity.meta.type,
                        ({ entity }) => 0,
                        ({ entity }) => Math.floor(entity.world.facing / 90) * 90,
                    ]
                });
            case "terrain":
                return new ImageRegistry(TerrainTemplate, {
                    seedFn: () => new SpriteSheet(),
                    lookupFns: [
                        ({ entity }) => TerrainLookup(entity.terrain.type),
                        // ({ entity }) => {
                        //     // if(entity.terrain.edges === 0) {
                        //     //     return TerrainLookup(entity.terrain.type);
                        //     // } else {
                        //     //     return "water";
                        //     // }

                        //     return entity.terrain.edges === 0 ? TerrainLookup(entity.terrain.type) : "water";
                        // },
                        ({ entity }) => 0,
                        ({ entity }) => Math.floor(entity.world.facing / 90) * 90,
                    ]
                });
            default:
                return null;
        }
    }
});

export default repository;