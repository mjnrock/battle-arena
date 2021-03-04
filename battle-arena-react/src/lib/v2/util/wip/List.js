import Agency from "@lespantsfancy/agency";

/**
 * <List> will only ever emit a given index once--deletions do not reduce the index
 */
export class List extends Agency.Observable {
    constructor() {
        super(false, { noWrap: true });

        this.__index = 0;
            
        return new Proxy(this, {
            get(target, prop) {
                return target[ prop ];
            },
            set(target, prop, value) {
                if(prop === "__index" || prop === "index")  {
                    target[ prop ] = value;

                    return target;
                }

                if(Array.isArray(value)) {
                    target[ this.__index ] = value;
                } else if(deep && (typeof value === "object" || value instanceof Observable)) {
                    const ob = value instanceof Observable ? value : Factory(value);
                    ob.next = (...args) => {
                        const props = [ prop, ...args.slice(0, args.length - 1) ].join(".");

                        target.next(props, args.pop());
                    };

                    target[ this.__index ] = ob;
                } else {
                    target[ this.__index ] = value;
                }

                target.next(prop, target[ this.__index ]);

                this.__index += 1;

                return target;
            },
        });
    }

    get index() {
        return this.__index + 1;
    }
};

export default Iterator;