import { Sprite } from "./Sprite";

export class Tessellation {
    constructor(canvasMap = {}) {
        this.source = canvasMap;

        this.mode = "absolute";
        this.data = [];
    }

    reset() {
        this.data = [];

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
            if(!this.data.length) {     // No data presently entered, add
                this.data.push(bps);
            } else {
                if(Array.isArray(this.data[ 0 ])) {     // No BPS in the first slot, add
                    this.data.unshift(bps);
                } else {        // BPS present in the first slot, overwrite
                    this.data[ 0 ] = bps;
                }
            }
        }

        return this;
    }

    add(key, duration, repeat = 1) {
        this.data.push([
            key,
            duration,
            repeat,
        ]);

        return this;
    }

    score(includeSource = false) {
        let pattern;
        if(this.mode === "absolute") {
            pattern = [ ...this.data ].map(([ key, duration, repeat ]) => {
                return [ key, duration * repeat ];
            });
        } else if(this.mode === "relative") {
            const bps = this.data[ 0 ];
            
            pattern = [ ...this.data ].slice(1).map(([ key, duration, repeat ]) => {
                return [ key, duration / bps * 1000 * repeat ];
            });
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
        const score = this.score(false).map(([ key, duration ]) => [ this.source[ key ], duration, key ]);
        
        if(purgePattern) {
            this.reset();
        }

        return new Sprite(score);
    }
}

export default Tessellation;