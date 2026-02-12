const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            // Health check endpoint for Railway
            if (req.url === '/health' || req.url === '/api/health') {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
                return;
            }

            // Skip Next.js handling for socket.io requests
            if (req.url.startsWith('/socket.io')) {
                return;
            }

            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join-room", (roomId, userId) => {
            console.log(`User ${userId} joined room ${roomId}`);
            socket.join(roomId);
            // Send the socket ID along with userId so peers can target each other
            socket.to(roomId).emit("user-connected", userId, socket.id);

            socket.on("disconnect", () => {
                console.log(`User ${userId} disconnected from room ${roomId}`);
                socket.to(roomId).emit("user-disconnected", userId);
            });
        });

        socket.on("offer", (payload) => {
            // Include sender's socket ID so answerer knows who to respond to
            io.to(payload.target).emit("offer", { ...payload, from: socket.id });
        });

        socket.on("answer", (payload) => {
            io.to(payload.target).emit("answer", payload);
        });

        socket.on("ice-candidate", (incoming) => {
            io.to(incoming.target).emit("ice-candidate", incoming.candidate);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
