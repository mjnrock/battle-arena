import React, { useEffect, useRef } from "react";

export function VideoStream({ stream, ...rest } = {}) {
    const videoRef = useRef();

    useEffect(() => {
        videoRef.current.srcObject = stream;
    }, [ stream ]);

    return (
        <video ref={ videoRef } autoPlay { ...rest } />
    );
};

export default VideoStream;