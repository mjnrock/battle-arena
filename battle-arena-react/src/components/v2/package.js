/* eslint-disable */
import { useState, useEffect, useContext } from "react";

import Watcher from "./../../lib/v2/util/agency/Watcher";
import Watchable from "./../../lib/v2/util/agency/Watchable";
// import Watcher from "./../Watcher";
// import Watchable from "./../Watchable";
// import Watcher from "@lespantsfancy/agency/lib/Watcher";
// import Watchable from "@lespantsfancy/agency/lib/Watchable";

export function useWatchable(context, prop) {
    const ctx = useContext(context);
    const subject = prop ? ctx[ prop ] : ctx;
    
    const [ watcher, setWatcher ] = useState(new Watcher([ subject ]));
    const [ data, setData ] = useState(subject instanceof Watchable ? subject.$.toData() : {});

    useEffect(() => {
        const fn = function(prop, value) {
            if(subject) {
                setData({
                    ...data,
                    [ prop ]: value,
                });
            }
        };

        watcher.$.subscribe(fn);

        return () => {
            watcher.$.unsubscribe(fn);
            setWatcher(null);
        };
    }, [ subject ]);

    return { data, subject, watcher };
};

export default {
    useWatchable,
};