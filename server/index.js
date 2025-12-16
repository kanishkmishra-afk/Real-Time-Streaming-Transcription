import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer } from "ws";
import { createDeepgramLiveSession } from "./deepgramSession.js";

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

console.log(`🚀 WebSocket server running on ws://localhost:${process.env.PORT || 8080}`);

wss.on("connection", async (clientWs) => {
  console.log("👤 Client connected");
  
  let deepgramSession = null;
  let isSessionReady = false;

  try {
    deepgramSession = await createDeepgramLiveSession((transcriptionData) => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "transcript",
            ...transcriptionData,
          })
        );
      }
    });

    isSessionReady = true;
    console.log("✓ Deepgram session created for client");

    if (clientWs.readyState === clientWs.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: "connection",
          status: "ready",
          message: "Connected to transcription service",
        })
      );
    }
  } catch (error) {
    console.error("Error creating Deepgram session:", error);
    if (clientWs.readyState === clientWs.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          message: "Failed to initialize transcription service",
        })
      );
    }
    clientWs.close(1011, "Failed to initialize");
    return;
  }

  clientWs.on("message", (data, isBinary) => {
    if (!isBinary) {
      try {
        const message = JSON.parse(data);
        console.log("Received command:", message.type);
      } catch (e) {
        console.log("Received text:", data);
      }
      return;
    }

    if (isSessionReady && deepgramSession) {
      deepgramSession.sendAudio(data);
    }
  });

  clientWs.on("close", () => {
    console.log("👤 Client disconnected");
    if (deepgramSession) {
      deepgramSession.close();
    }
  });

  clientWs.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
});

