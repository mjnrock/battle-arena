import Agency from "@lespantsfancy/agency";
import SpriteSheet from "../../render/SpriteSheet";

import ImageRegistry, { EntityTemplate, TerrainTemplate, EffectTemplate } from "./../../render/ImageRegistry";

import { TerrainLookup } from "./../../entity/component/Terrain";

export const repository = (root) => new Agency.Util.CrossMap([
    root || [
        "creature",
        "terrain",
        "effect",
    ],
], {
    seedFn: (chain) => {
        switch(chain) {
            case "creature":
                return new ImageRegistry(EntityTemplate, {
                    seedFn: () => new SpriteSheet(),
                    lookupFns: [
                        ({ entity }) => entity.meta.subtype,
                        //STUB
                        // ({ entity }) => entity.state.current.type,
                        ({ entity }) => 0,
                        ({ entity }) => Math.floor(entity.world.facing / 90) * 90,
                    ]
                });
            case "terrain":
                return new ImageRegistry(TerrainTemplate, {
                    seedFn: () => new SpriteSheet(),
                    lookupFns: [
                        ({ entity }) => TerrainLookup(entity.terrain.type),
                        //STUB
                        // ({ entity }) => entity.state.current.type,
                        ({ entity }) => 0,
                        ({ entity }) => Math.floor(entity.world.facing / 90) * 90,
                    ]
                });
            case "effect":
                return new ImageRegistry(EffectTemplate, {
                    seedFn: () => new SpriteSheet(),
                    lookupFns: [
                        ({ entity }) => entity.meta.subtype,
                        //STUB
                        // ({ entity }) => entity.state.current.type,
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