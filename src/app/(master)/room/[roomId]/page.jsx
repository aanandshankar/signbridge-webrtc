"use client";

import { use } from "react";
import VideoCall from "@/components/custom/VideoCall";

export default function RoomPage({ params }) {
    // In Next.js 15+, params is a promise, so we must unwrap it using React.use()
    const { roomId } = use(params);

    return (
        <div className="h-screen w-full bg-gray-900">
            <VideoCall roomId={roomId} />
        </div>
    );
}
