// src/hooks/useActiveUsers.js
import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.min.js";

const useActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let stompClient = null;

    const initWebSocket = () => {
      try {
        // Create SockJS connection to your backend
        const socket = new SockJS("https://api.jharkhandbiharupdates.com/ws");

        stompClient = new Client({
          webSocketFactory: () => socket,
          debug: (str) => {
            // Log only important events
            if (
              str.includes("ERROR") ||
              str.includes("CONNECT") ||
              str.includes("DISCONNECT")
            ) {
              console.log("[ActiveUsers WS]", str);
            }
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
          console.log("✅ Active Users WebSocket Connected");
          setConnected(true);

          stompClient.subscribe("/topic/activeUsers", (message) => {
            try {
              const count = parseInt(message.body, 10);
              if (!Number.isNaN(count)) {
                setActiveUsers(count);
                console.log("📊 Active users:", count);
              }
            } catch (e) {
              console.error("Failed to parse active users count:", e);
            }
          });
        };

        stompClient.onStompError = (frame) => {
          console.error(
            "❌ WebSocket STOMP error:",
            frame.headers?.message || "Unknown error"
          );
          setConnected(false);
        };

        stompClient.onWebSocketError = (event) => {
          console.error("❌ WebSocket low-level error:", event);
          setConnected(false);
        };

        stompClient.onDisconnect = () => {
          console.log("🔌 WebSocket Disconnected");
          setConnected(false);
        };

        stompClient.onWebSocketClose = () => {
          console.log("🔌 WebSocket Connection Closed");
          setConnected(false);
        };

        stompClient.activate();
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        setConnected(false);
      }
    };

    initWebSocket();

    return () => {
      if (stompClient && stompClient.connected) {
        try {
          stompClient.deactivate();
        } catch (e) {
          console.error("Error deactivating WebSocket:", e);
        }
      }
    };
  }, []);

  return { activeUsers, connected };
};

export default useActiveUsers;
