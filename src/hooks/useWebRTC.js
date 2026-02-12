import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const ICE_SERVERS = {
    iceServers: [
        {
            urls: "stun:stun1.l.google.com:19302"
        },
        {
            urls: "stun:stun2.l.google.com:19302"
        },
        {
            urls: "turn:34.100.173.6:3478",
            username: "webrtc",
            credential: "webrtc123"
        },
        // Free public TURN servers (Metered.ca - reliable for cross-network)
        {
            urls: "turn:a.relay.metered.ca:80",
            username: "87cf89d8c2a0296a9666d5e3",
            credential: "n4lQi0E/TGp5K4zw"
        },
        {
            urls: "turn:a.relay.metered.ca:443",
            username: "87cf89d8c2a0296a9666d5e3",
            credential: "n4lQi0E/TGp5K4zw"
        },
        {
            urls: "turn:a.relay.metered.ca:443?transport=tcp",
            username: "87cf89d8c2a0296a9666d5e3",
            credential: "n4lQi0E/TGp5K4zw"
        }
    ],
    iceTransportPolicy: "all",
    iceCandidatePoolSize: 10,
};

export default function useWebRTC(roomId, userId) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("disconnected");

    const socketRef = useRef();
    const peerConnectionRef = useRef();
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    // Track the peer's socket ID for direct P2P signaling
    const peerSocketIdRef = useRef(null);

    // "Polite peer" pattern: determined by comparing userId/socketId
    const isPolite = useRef(false);
    const isMakingOffer = useRef(false);
    const ignoreOffer = useRef(false);

    useEffect(() => {
        if (!roomId || !userId) return;

        let mounted = true;

        console.log(`🔄 useWebRTC Effect Triggered for Room: ${roomId}, User: ${userId}`);

        const initializeWebRTC = async () => {
            try {
                console.log(`🔗 Initializing WebRTC...`);
                setConnectionStatus("initializing");

                // 1. Initialize Socket
                socketRef.current = io({
                    path: "/socket.io",
                    transports: ['websocket'], // Force websocket to avoid polling issues
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                });

                socketRef.current.on('connect', () => {
                    if (!mounted) return;
                    console.log('✅ Socket connected:', socketRef.current.id);
                    setConnectionStatus("socket-connected");
                    // Join the room once connected
                    socketRef.current.emit("join-room", roomId, userId);
                });

                socketRef.current.on('connect_error', (err) => {
                    console.error('❌ Socket connection error:', err);
                    setConnectionStatus("socket-error");
                });

                // 2. Create Peer Connection (BEFORE Media)
                console.log("�️ Creating PeerConnection...");
                peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

                // Setup PC Event Handlers
                peerConnectionRef.current.onicecandidate = (event) => {
                    if (event.candidate && socketRef.current && peerSocketIdRef.current) {
                        console.log("🧊 Sending ICE candidate to:", peerSocketIdRef.current);
                        socketRef.current.emit("ice-candidate", {
                            target: peerSocketIdRef.current,
                            candidate: event.candidate,
                        });
                    }
                };

                peerConnectionRef.current.ontrack = (event) => {
                    console.log('📺 Received remote track');
                    if (mounted && event.streams[0]) {
                        console.log("🎥 Setting remote stream");
                        setRemoteStream(event.streams[0]);
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = event.streams[0];
                        }
                    }
                };

                peerConnectionRef.current.oniceconnectionstatechange = () => {
                    console.log('🧊 ICE State:', peerConnectionRef.current?.iceConnectionState);
                    if (mounted) {
                        setConnectionStatus(`ice-${peerConnectionRef.current?.iceConnectionState}`);
                    }
                };

                // Perfect Negotiation Logic
                peerConnectionRef.current.onnegotiationneeded = async () => {
                    try {
                        // Only make offer if we have a target (peerSocketId)
                        // If we don't know who to send to, we can't negotiate yet.
                        if (!peerSocketIdRef.current) {
                            console.log("⏳ Negotiation needed but no peer yet. Waiting.");
                            return;
                        }

                        isMakingOffer.current = true;
                        await peerConnectionRef.current.setLocalDescription();
                        socketRef.current.emit("offer", {
                            target: peerSocketIdRef.current,
                            offer: peerConnectionRef.current.localDescription
                        });
                        console.log("📤 Offer sent (negotiation needed) to:", peerSocketIdRef.current);
                    } catch (err) {
                        console.error("Error during negotiation:", err);
                    } finally {
                        isMakingOffer.current = false;
                    }
                };

                // Setup Socket Event Handlers (Before Media)
                socketRef.current.on("user-connected", async (newUserId, newSocketId) => {
                    console.log("👤 User connected:", newUserId, "Socket:", newSocketId);
                    // Store the peer's socket ID
                    peerSocketIdRef.current = newSocketId;

                    // We are existing user (Caller). The new user (Joiner) is ready.
                    // initiate the offer manually since onnegotiationneeded probably fired before we had a target.
                    try {
                        console.log("📞 Initiating call to new user:", newSocketId);
                        isMakingOffer.current = true;
                        // Create offer
                        const offer = await peerConnectionRef.current.createOffer();
                        await peerConnectionRef.current.setLocalDescription(offer);

                        socketRef.current.emit("offer", {
                            target: peerSocketIdRef.current,
                            offer: peerConnectionRef.current.localDescription
                        });
                        console.log("📤 Offer sent (manual initiation) to:", peerSocketIdRef.current);
                    } catch (err) {
                        console.error("Error initiating offer:", err);
                    } finally {
                        isMakingOffer.current = false;
                    }
                });

                socketRef.current.on("offer", async (payload) => {
                    console.log("📥 Received offer from:", payload.from);
                    if (!peerConnectionRef.current) return;

                    // Capture sender's socket ID from payload if we don't have it
                    if (payload.from) {
                        peerSocketIdRef.current = payload.from;
                    }

                    try {
                        const offerCollision = isMakingOffer.current || peerConnectionRef.current.signalingState !== "stable";
                        ignoreOffer.current = !isPolite.current && offerCollision;

                        if (ignoreOffer.current) {
                            console.log("🛡️ Ignoring offer (impolite peer collision)");
                            return;
                        }

                        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
                        await peerConnectionRef.current.setLocalDescription();

                        socketRef.current.emit("answer", {
                            target: peerSocketIdRef.current, // Send back to caller
                            answer: peerConnectionRef.current.localDescription
                        });
                        console.log("📤 Answer sent to:", peerSocketIdRef.current);
                    } catch (err) {
                        console.error("Error handling offer:", err);
                    }
                });

                socketRef.current.on("answer", async (payload) => {
                    console.log("📥 Received answer");
                    if (!peerConnectionRef.current) return;
                    try {
                        const currentSignalingState = peerConnectionRef.current.signalingState;
                        if (currentSignalingState === "stable") {
                            console.warn("⚠️ Received answer while in stable state. Ignoring.");
                            return;
                        }
                        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
                    } catch (err) {
                        console.error("Error handling answer:", err);
                    }
                });

                socketRef.current.on("ice-candidate", async (candidate) => {
                    // console.log("🧊 Received ICE candidate");
                    if (!peerConnectionRef.current) return;
                    try {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (err) {
                        if (!ignoreOffer.current) {
                            console.error("Error adding ICE candidate:", err);
                        }
                    }
                });

                socketRef.current.on("user-disconnected", () => {
                    console.log("👤 User disconnected");
                    if (mounted) {
                        setRemoteStream(null);
                        peerSocketIdRef.current = null; // Clear peer ID
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = null;
                        }
                    }
                });

                // 3. Get User Media (Last, so failures don't block signaling)
                try {
                    // Detect if mobile device
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    // Use lower quality on desktop to prevent lag, higher on mobile
                    const videoConstraints = isMobile ? {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        frameRate: { ideal: 30 }
                    } : {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        frameRate: { ideal: 24 }
                    };

                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: videoConstraints,
                        audio: true
                    });

                    if (!mounted) {
                        console.log("🛑 Component unmounted before media stream secured. Stopping tracks.");
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    console.log('📹 Got local media stream');
                    setLocalStream(stream);
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }

                    // Add local tracks to PC
                    stream.getTracks().forEach((track) => {
                        if (peerConnectionRef.current) {
                            peerConnectionRef.current.addTrack(track, stream);
                        }
                    });
                } catch (mediaErr) {
                    console.error("🚨 Media Device Error (Camera/Mic blocked?):", mediaErr);
                    // Do NOT throw. We want socket to remain active to debug signaling.
                    // Just alert user (maybe set status)
                    setConnectionStatus("media-error");
                }

            } catch (err) {
                console.error("❌ Initialization error:", err);
                if (mounted) setConnectionStatus("error");
            }
        };

        initializeWebRTC();

        // Cleanup
        return () => {
            mounted = false;
            console.log(`🧹 Cleaning up WebRTC for room: ${roomId}, user: ${userId}`);

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }

            if (socketRef.current) {
                console.log("🔴 Disconnecting socket...");
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
            }

            if (peerConnectionRef.current) {
                console.log("🛑 Closing PeerConnection...");
                peerConnectionRef.current.close();
            }
        };
    }, [roomId, userId]);

    // or just default to allowing all offers for now but adding the 'stable' check which is the critical fix.

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    return {
        localVideoRef,
        remoteVideoRef,
        toggleAudio,
        toggleVideo,
        isMuted,
        isVideoOff,
        connectionStatus
    };
}
