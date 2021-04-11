import Agency from "@lespantsfancy/agency";
import SpriteSheet from "../../render/SpriteSheet";

import ImageRegistry, { EntityTemplate, TerrainTemplate, EffectTemplate } from "./../../render/ImageRegistry";

import { TerrainLookup } from "./../../entity/component/Terrain";

export const repository = (root) => new Agency.Util.CrossMap([
    root || [
        "entity",
        "terrain",
        "effect",
    ],
], {
    seedFn: (chain) => {
        switch(chain) {
            case "entity":
                return new ImageRegistry(EntityTemplate, {
                    seedFn: () => new SpriteSheet(),
                    lookupFns: [
                        ({ entity }) => entity.meta.subtype,
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
            case "effect":
                return new ImageRegistry(EffectTemplate, {
                    seedFn: () => new SpriteSheet(),
                    lookupFns: [
                        ({ entity }) => entity.meta.subtype,
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