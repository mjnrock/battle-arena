import crypto from "crypto";

import Sprite from "./Sprite";

export class Tessellation {
    constructor(canvasMap = {}) {
        this.source = canvasMap;

        this.mode = "absolute";
        this.info = {
            index: 0,
            data: [[]],
        };
    }

    get current() {
        return this.info.data[ this.info.index ];
    }

    reset() {
        this.info = {
            index: 0,
            data: [[]],
        };

        return this;
    }
    absolute() {
        this.mode = "absolute";
        
        return this.reset();
    }
    relative(bps) {
        this.mode = "relative";

        this.reset();

        return this.bps(bps);
    }

    bps(bps) {
        if(this.mode === "relative") {  // Skip function if not in "relative" mode
            this.info.bps = bps;
        }

        return this;
    }

    add(key, duration, repeat = 1) {
        this.current.push([
            key,
            duration,
            repeat,
        ]);

        return this;
    }

    row() {
        ++this.info.index;

        this.info.data[ this.info.index ] = [];

        return this;
    }    
    useRow(i = 0) {
        if(i < this.info.data.length) {
            this.info.index = Math.max(0, +i);
        }

        return this;
    }

    score(includeSource = false) {
        let pattern = [];
        if(this.mode === "absolute") {
            for(let row of this.info.data) {
                pattern.push(row.map(([ key, duration, repeat ]) => {
                    return [ key, duration * repeat ];
                }));
            }
        } else if(this.mode === "relative") {
            const bps = this.info.bps;
            for(let row of this.info.data) {
                pattern.push(row.map(([ key, duration, repeat ]) => {
                    return [ key, duration / bps * 1000 * repeat ];
                }));
            }
        }

        if(includeSource) {
            return {
                source: this.source,
                pattern,
            };
        }

        return pattern;
    }

    toSprite({ purgePattern = false } = {}) {
        const obj = this.score(true);
        const sprites = [];
        for(let row of obj.pattern) {
            let width = 0,
                height = 0;

            sprites.push(new Sprite(
                    row.map(([ key, duration ]) => {
                        const frame = obj.source[ key ];
            
                        width += frame.width;
                        height = Math.max(height, frame.height);
                        
                        const base64 = frame.toDataURL("image/png", 1.0);
            
                        return [ frame, duration, key, crypto.createHash("md5").update(base64).digest("hex") ];
                    }),
                    {
                        width,
                        height,
                    },
                )
            );
        }
        
        if(purgePattern) {
            this.reset();
        }

        return sprites;
    }
}

export default Tessellation;