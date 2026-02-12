"use client";

import useWebRTC from "@/hooks/useWebRTC";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Link2, Check, Minimize2, Maximize2, MoveUpRight, MoveUpLeft, MoveDownRight, MoveDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VideoCall({ roomId }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false); // false = remote main, true = local main
    const [corner, setCorner] = useState("top-right"); // top-right, top-left, bottom-right, bottom-left

    // Mock user ID for testing without auth - properly memoized
    const [userId] = useState(() => `user-${Math.floor(Math.random() * 10000)}`);

    console.log(`🎬 VideoCall Render. Room: ${roomId}, User: ${userId}`);

    const {
        localVideoRef,
        remoteVideoRef,
        toggleAudio,
        toggleVideo,
        isMuted,
        isVideoOff,
    } = useWebRTC(roomId, userId);

    const handleEndCall = () => {
        router.push("/");
    };

    const handleCopyLink = async () => {
        const roomUrl = `${window.location.origin}/room/${roomId}`;
        try {
            await navigator.clipboard.writeText(roomUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const cycleCorner = () => {
        const corners = ["top-right", "top-left", "bottom-left", "bottom-right"];
        const currentIndex = corners.indexOf(corner);
        const nextIndex = (currentIndex + 1) % corners.length;
        setCorner(corners[nextIndex]);
    };

    const toggleSwap = () => {
        setIsSwapped(!isSwapped);
    };

    // Position classes based on corner
    const getPositionClasses = () => {
        switch (corner) {
            case "top-right": return "top-4 right-4";
            case "top-left": return "top-4 left-4";
            case "bottom-right": return "bottom-24 right-4";
            case "bottom-left": return "bottom-24 left-4";
            default: return "top-4 right-4";
        }
    };

    // Determine which video goes where
    const mainVideoRef = isSwapped ? localVideoRef : remoteVideoRef;
    const pipVideoRef = isSwapped ? remoteVideoRef : localVideoRef;
    const isPipVideoOff = isSwapped ? false : isVideoOff; // Only local video can be turned off

    return (
        <div className="flex flex-col h-full bg-gray-900 overflow-hidden relative rounded-xl border border-gray-800">
            {/* Main Video (Full Screen) */}
            <video
                ref={mainVideoRef}
                autoPlay
                playsInline
                muted={isSwapped} // Mute local video when it's main to avoid echo
                className={`w-full h-full object-cover bg-black ${isSwapped ? 'transform scale-x-[-1]' : ''}`}
                style={{ backgroundColor: '#1a1a1a' }}
            />

            {/* Picture-in-Picture Video (Corner Overlay) */}
            <div className={`absolute ${getPositionClasses()} w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl transition-all duration-300 group`}>
                <video
                    ref={pipVideoRef}
                    autoPlay
                    playsInline
                    muted={!isSwapped} // Mute local video when it's PiP
                    className={`w-full h-full object-cover ${!isSwapped ? 'transform scale-x-[-1]' : ''} ${isPipVideoOff ? "hidden" : "block"}`}
                />
                {isPipVideoOff && (
                    <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                        Camera Off
                    </div>
                )}

                {/* Mini Controls on PiP Video */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={toggleSwap}
                        className="bg-gray-900/80 hover:bg-gray-800 p-1.5 rounded backdrop-blur-sm"
                        title="Swap videos"
                    >
                        {isSwapped ? (
                            <Minimize2 className="h-3 w-3 text-white" />
                        ) : (
                            <Maximize2 className="h-3 w-3 text-white" />
                        )}
                    </button>
                    <button
                        onClick={cycleCorner}
                        className="bg-gray-900/80 hover:bg-gray-800 p-1.5 rounded backdrop-blur-sm"
                        title="Move to corner"
                    >
                        {corner === "top-right" && <MoveUpRight className="h-3 w-3 text-white" />}
                        {corner === "top-left" && <MoveUpLeft className="h-3 w-3 text-white" />}
                        {corner === "bottom-left" && <MoveDownLeft className="h-3 w-3 text-white" />}
                        {corner === "bottom-right" && <MoveDownRight className="h-3 w-3 text-white" />}
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-sm p-4 rounded-full border border-white/10 shadow-2xl">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleAudio}
                >
                    {isMuted ? (
                        <MicOff className="h-5 w-5" />
                    ) : (
                        <Mic className="h-5 w-5" />
                    )}
                </Button>

                <Button
                    variant={isVideoOff ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleVideo}
                >
                    {isVideoOff ? (
                        <VideoOff className="h-5 w-5" />
                    ) : (
                        <Video className="h-5 w-5" />
                    )}
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
                    onClick={handleEndCall}
                >
                    <PhoneOff className="h-5 w-5" />
                </Button>

                <Button
                    variant={copied ? "default" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={handleCopyLink}
                    title="Copy meeting link"
                >
                    {copied ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <Link2 className="h-5 w-5" />
                    )}
                </Button>
            </div>
        </div>
    );
}
