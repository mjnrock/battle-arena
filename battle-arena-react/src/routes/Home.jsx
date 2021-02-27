/* eslint-disable */
import React, { useState } from "react";
import { Segment } from "semantic-ui-react";

import Agency from "@lespantsfancy/agency";
import { Components } from "@lespantsfancy/agency/lib/react/package";
// import Observable from "./../components/v2/Observable"

import GameView from "../components/v2/GameView";
import MetaView from "../components/v2/MetaView";

export default function Home() {
    const [ observable, setObservable ] = useState(Agency.Observable.Factory({
        cats: 15,
        fish: 96,
    }));

    return (
        <Segment textAlign="center">
            <Components.Observable
                observable={ observable }
            />

            <GameView />
            <MetaView />
        </Segment>
    )
}