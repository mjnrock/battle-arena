import Agency from "@lespantsfancy/agency";

export class Iterator extends Agency.Observable {
    constructor() {
        super(false, { noWrap: true });

        this.__current = 0;
        this.__index = 0;
            
        return new Proxy(this, {
            get(target, prop) {
                return target[ prop ];
            },
            set(target, prop, value) {
                if(prop === "__index" || prop === "index")  {
                    if(target[ value ] !== void 0) {
                        target[ prop ] = value;
                    } else {
                        if((value + 1) < this.size) {
                            target[ prop ] = value + 1;
                        } else {
                            target[ prop ] = 0;
                        }
                    }

                    return target;
                }

                if(Array.isArray(value)) {
                    target[ this.__index ] = value;
                } else if(deep && (typeof value === "object" || value instanceof Agency.Observable)) {
                    const ob = value instanceof Agency.Observable ? value : Factory(value);
                    ob.next = (...args) => {
                        const props = [ prop, ...args.slice(0, args.length - 1) ].join(".");

                        target.next(props, args.pop());
                    };

                    target[ this.__index ] = ob;
                } else {
                    target[ this.__index ] = value;
                }

                target.next(prop, target[ this.__index ]);

                if((this.__index + 1) <= (this.size - 1)) {
                    this.__index += 1;
                } else {
                    this.__index = 0;
                }

                return target;
            },
        });
    }

    get size() {
        return Object.keys(this).reduce((a, v) => {
            if(~~+v > a) {
                return ~~+v;
            }

            return a;
        }) + 1;
    }
    get index() {
        return this.__index + 1;
    }
};

export default Iterator;