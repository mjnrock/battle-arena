/* eslint-disable */
import { Segment, Header } from "semantic-ui-react";
import { useBeacon, Components } from "@lespantsfancy/agency/lib/react/package";

import { Context } from "./../../App";

import Observable from "./Observable";

export default function MetaView() {
    const { data, beacon: game } = useBeacon(Context, "game");
    
    if(Object.keys(data).length === 0 || !game) {
        return null;
    }

    return (
        <Segment textAlign="center">
            <Header style={{ fontFamily: "monospace" }} as="h3" textAlign="center">Meta Data</Header>

            <Observable
                observable={ game.world.entities.player }
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