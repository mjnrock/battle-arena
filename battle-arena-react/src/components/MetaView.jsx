/* eslint-disable */
import { Segment, Header } from "semantic-ui-react";
import { useBeacon } from "@lespantsfancy/agency/lib/react/package";

import { Context } from "./../../App";

export default function MetaView() {
    const { data, beacon: game } = useBeacon(Context, "game");
    
    if(Object.keys(data).length === 0 || !game) {
        return null;
    }

    return (
        <Segment textAlign="center" inverted basic>
            {/* <Header style={{ fontFamily: "monospace" }} as="h3" textAlign="center">Meta Data</Header> */}

            {/* <Beacon
                beacon={ game }
            /> */}
            {/* <Observable
                observable={ game.world.current.entities }
            /> */}
            {/* <Observer
                observer={ game.world.currentObserver }
            /> */}
        </Segment>
    )
}