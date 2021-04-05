import Agency from "@lespantsfancy/agency";

export const handlers = [
    [ "portal", function(args) {
        Agency.Event.Network.$.share("world", this, args);      // pass the event to the "world" <Context>
    }],
];

export default handlers;