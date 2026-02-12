"use client";

import VideoCall from "@/components/custom/VideoCall";

export default function TestCallPage() {
    return (
        <div className="h-screen w-full bg-gray-900">
            <VideoCall roomId="test-room-123" />
        </div>
    );
}
