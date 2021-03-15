import Agency from "@lespantsfancy/agency";

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

export default repository;