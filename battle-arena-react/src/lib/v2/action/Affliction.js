/**
 * An <Affliction> will apply *every* <Effect>
 *  to *every* <Point> within it.
 */
export class Affliction {
    /**
     * @qualifier Should only qualify entities at a relational/existential level only
     */
    constructor(points = [], effects = [], qualifier) {
        if(typeof points === "function") {
            this.points = points;
        } else if(Array.isArray(points)) {
            if(!Array.isArray(points[ 0 ])) {
                this.points = [ points ];
            } else {
                this.points = points;
            }
        }

        if(!Array.isArray(effects)) {
            this.effects = [ effects ];
        } else {
            this.effects = effects;
        }

        if(typeof qualifier === "function") {
            this.qualifier = qualifier;
        } else {
            this.qualifier = () => true;
        }
    }
};

export default Affliction;