import Agency from "@lespantsfancy/agency";

import Observer from "./Observer";
import Observable from "./Observable";

export default function Beacon(props) {
    const { beacon } = props;

    if(!beacon) {
        return null;
    }

    const members = [ ...beacon.members.entries() ].map(([ ,{ member } ]) => {
        if(member instanceof Agency.Observable) {
            return (
                <Observable
                    key={ member.__id }
                    observable={ member }
                />
            );
        } else if(member instanceof Agency.Observer) {
            return (
                <Observer
                    key={ member.__id }
                    observer={ member }
                />
            );
        }

        return null;
    });

    return (
        <>
            { members }
        </>
    )
};