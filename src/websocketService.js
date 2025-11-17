// ws-client.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function createWebSocketClient(token, groupId, onConnect, onError, onPresenceUpdate) {
  try {
    // 🔹 Ensure SockJS upgrades correctly
    const socketUrl = `${API_URL}/api/ws?token=${encodeURIComponent(token)}`;
    console.log("Connecting to:", socketUrl);

    const stompClient = new Client({
      // Explicit SockJS factory ensures proper handshake and upgrade
      webSocketFactory: () => new SockJS(socketUrl, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      }),

      // STOMP CONNECT headers (for JwtChannelInterceptor)
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      debug: (msg) => console.debug("STOMP Debug:", msg), // ✅ Helps verify frames in console

      onConnect: (frame) => {
        console.log("✅ Connected:", frame);
        onConnect(true);

        // Subscribe to presence topic
        stompClient.subscribe(`/topic/group/${groupId}/membership-status`, (message) => {
          try {
            const presenceData = JSON.parse(message.body);
            onPresenceUpdate(presenceData);
          } catch (err) {
            console.error("Error parsing presence data:", err);
          }
        });
      },

      onStompError: (frame) => {
        console.error("❌ STOMP protocol error:", frame.headers["message"]);
        console.error("Details:", frame.body);
        onError("STOMP error: " + frame.headers["message"]);

        safeClose(stompClient, onConnect, onError);
      },

      onWebSocketError: (event) => {
        console.error("❌ WebSocket transport error:", event);
        onError("WebSocket transport error");
        safeClose(stompClient, onConnect, onError);
      },

      onWebSocketClose: (event) => {
        console.warn("⚠️ WebSocket closed:", event.reason);
        onConnect(false);
        if (event.code !== 1000) {
          safeClose(stompClient, onConnect, onError);
        }
      },
    });

    return stompClient;
  } catch (err) {
    console.error("❌ Error creating WebSocket client:", err);
    onError("Failed to create WebSocket client");
    return null;
  }
}

function safeClose(client, onConnect, onError) {
  try {
    if (client && client.active) {
      client.deactivate();
      console.warn("🔴 WebSocket connection deactivated due to fatal error");
    }
  } catch (cleanupErr) {
    console.error("Error during safe cleanup:", cleanupErr);
  } finally {
    onConnect(false);
    onError("Connection closed due to unrecoverable error");
  }
}

// // ws-client.js
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// export const createWebSocketClient = (token, groupId, onConnect, onError, onPresenceUpdate) => {
//   if (!token) {
//     onError && onError('Authentication token missing. Please log in again.');
//     return null;
//   }
//   if (!groupId) {
//     onError && onError('groupId is required to subscribe to presence updates.');
//     return null;
//   }

//   const stompClient = new Client({
//     // ✅ Token added in URL for initial WebSocket handshake (backend can read)
//     webSocketFactory: () => new SockJS(`${API_URL}/api/ws?token=${token}`),

//     // ✅ Token also added in STOMP CONNECT frame headers
//     connectHeaders: {
//       Authorization: `Bearer ${token}`,
//     },

//     reconnectDelay: 50000,
//     heartbeatIncoming: 0,
//     heartbeatOutgoing: 0,
//   });

//   let heartbeatInterval = null;
//   let subscription = null;

//   stompClient.onConnect = (frame) => {
//     console.log('✅ WebSocket connected:', frame?.headers);

//     onConnect && onConnect(true);

//     // ✅ Subscribe to presence updates
//     subscription = stompClient.subscribe(`/topic/group/${groupId}/membership-status`, (message) => {
//       let body = message.body;
//       try { body = JSON.parse(body); } catch {}
//       console.log('Presence update received:', body);
//       onPresenceUpdate && onPresenceUpdate(body);
//     });

//     // ✅ Send heartbeat to backend every 30s
//     heartbeatInterval = setInterval(() => {
//       if (stompClient?.active) {
//         stompClient.publish({ destination: '/app/heartbeat', body: '' });
//         console.log('❤️ Heartbeat sent');
//       }
//     }, 30000);
//   };

//   stompClient.onStompError = (frame) => {
//     console.error('STOMP error:', frame);
//     onError && onError(`WebSocket STOMP error: ${frame.body || frame}`);
//     onConnect && onConnect(false);
//   };

//   stompClient.onWebSocketError = (error) => {
//     console.error('WebSocket error:', error);
//     onError && onError('WebSocket error occurred.');
//     onConnect && onConnect(false);
//   };

//   stompClient.onWebSocketClose = () => {
//     console.log('❌ WebSocket closed');
//     onConnect && onConnect(false);
//     onError && onError('WebSocket connection closed. Retrying...');
//     if (heartbeatInterval) clearInterval(heartbeatInterval);
//     subscription = null;
//   };

//   const activate = () => {
//     try {
//       stompClient.activate();
//     } catch (err) {
//       console.error('Activation error:', err);
//       onError && onError('Failed to activate WebSocket client.');
//     }
//   };

//   const disconnect = () => {
//     if (stompClient?.active) {
//       try {
//         subscription && subscription.unsubscribe();
//         stompClient.deactivate();
//       } finally {
//         heartbeatInterval && clearInterval(heartbeatInterval);
//         onConnect && onConnect(false);
//         console.log('WebSocket disconnected');
//       }
//     }
//   };

//   return { stompClient, activate, disconnect };
// };


// ✅ Updated createWebSocketClient with fatal error cleanup
// export function createWebSocketClient(token, groupId, onConnect, onError, onPresenceUpdate) {
//   try {
//     const stompClient = new Client({
//       webSocketFactory: () => new SockJS(`${API_URL}/api/ws?token=${token}`),

//       connectHeaders: {
//         Authorization: `Bearer ${token}`,
//       },

//       reconnectDelay: 5000,
//       heartbeatIncoming: 10000,
//       heartbeatOutgoing: 10000,

//       onConnect: (frame) => {
//         console.log("✅ Connected:", frame);
//         onConnect(true);

//         // Subscribe to presence topic
//         stompClient.subscribe(`/topic/group/${groupId}/membership-status`, (message) => {
//           try {
//             const presenceData = JSON.parse(message.body);
//             onPresenceUpdate(presenceData);
//           } catch (err) {
//             console.error("Error parsing presence data:", err);
//           }
//         });
//       },

//       onStompError: (frame) => {
//         console.error("❌ STOMP protocol error:", frame.headers["message"]);
//         console.error("Details:", frame.body);
//         onError("STOMP error: " + frame.headers["message"]);

//         // 🚨 Fatal — can't recover
//         safeClose(stompClient, onConnect, onError);
//       },

//       onWebSocketError: (event) => {
//         console.error("❌ WebSocket transport error:", event);
//         onError("WebSocket transport error");

//         // 🚨 Fatal — close connection, do not try reconnect loop
//         safeClose(stompClient, onConnect, onError);
//       },

//       onWebSocketClose: (event) => {
//         console.warn("⚠️ WebSocket closed:", event.reason);
//         onConnect(false);

//         // If abnormal closure (not 1000), treat as fatal
//         if (event.code !== 1000) {
//           safeClose(stompClient, onConnect, onError);
//         }
//       },
//     });

//     return stompClient;
//   } catch (err) {
//     console.error("❌ Error creating WebSocket client:", err);
//     onError("Failed to create WebSocket client");
//     return null;
//   }
// }

// // ✅ Helper for safe cleanup
// function safeClose(client, onConnect, onError) {
//   try {
//     if (client && client.active) {
//       client.deactivate();
//       console.warn("🔴 WebSocket connection deactivated due to fatal error");
//     }
//   } catch (cleanupErr) {
//     console.error("Error during safe cleanup:", cleanupErr);
//   } finally {
//     onConnect(false);
//     onError("Connection closed due to unrecoverable error");
//   }
// }