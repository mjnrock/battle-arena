/* eslint-disable */
import { Segment, Header } from "semantic-ui-react";
import { useBeacon, Components } from "@lespantsfancy/agency/lib/react/package";

import { Context } from "./../../App";

export default function MetaView() {
    const { data, beacon: game } = useBeacon(Context, "game");
    
    if(Object.keys(data).length === 0) {
        return null;
    }

    return (
        <Segment textAlign="center">
            <Header style={{ fontFamily: "monospace" }} as="h3" textAlign="center">Meta Data</Header>

            <Components.Beacon
                beacon={ game }
            />
            {/* <Components.Observer
                observer={ game.loop }
            />
            <Components.Observable
                observable={ game.loop.subject }
            /> */}
        </Segment>
    )
}