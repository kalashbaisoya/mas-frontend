
// websocketManager.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_URL = process.env.REACT_APP_API_URL || 'http://10.145.90.153:8082/backend';

let wsClient = null;
const subscriptions = new Map();

/**
 * 🔌 Connect WebSocket once per user session
 */
export const connectWebSocket = (token, onConnect, onError) => {
  if (wsClient && wsClient.connected) return wsClient;

  wsClient = new Client({
    // ✅ Use SockJS with your existing backend URL
    webSocketFactory: () =>
      new SockJS(`${API_URL}/api/ws?token=${encodeURIComponent(token)}`, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      }),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    debug: (msg) => console.debug('STOMP Debug:', msg),

    onConnect: (frame) => {
      console.log('✅ Connected to WebSocket:', frame);
      onConnect?.(true);
    },

    onStompError: (frame) => {
      console.error('❌ STOMP protocol error:', frame);
      onError?.('STOMP error: ' + frame.headers['message']);
    },

    onWebSocketError: (event) => {
      console.error('❌ WebSocket error:', event);
      onError?.('WebSocket transport error');
    },

    onWebSocketClose: (event) => {
      console.warn('⚠️ WebSocket closed:', event.reason);
      onConnect?.(false);
    },
  });

  wsClient.activate();
  return wsClient;
};

/**
 * 👥 Subscribe to group-specific presence updates
 */
export const subscribeToGroup = (groupId, onPresenceUpdate) => {
  if (!wsClient || !wsClient.connected) {
    console.warn('WebSocket not connected yet');
    return;
  }

  if (subscriptions.has(groupId)) {
    console.log(`Already subscribed to group ${groupId}`);
    return;
  }

  const destination = `/topic/group/${groupId}/membership-status`;
  console.log(`🟢 Subscribing to ${destination}`);

  const sub = wsClient.subscribe(destination, (message) => {
    try {
      const data = JSON.parse(message.body);
      console.log(`📩 Presence update for group ${groupId}:`, data);
      onPresenceUpdate?.(groupId, data);
    } catch (err) {
      console.error('Error parsing presence update:', err);
    }
  });

  subscriptions.set(groupId, sub);
};

/**
 * 🔴 Unsubscribe from a specific group
 */
export const unsubscribeFromGroup = (groupId) => {
  const sub = subscriptions.get(groupId);
  if (sub) {
    sub.unsubscribe();
    subscriptions.delete(groupId);
    console.log(`🔴 Unsubscribed from group ${groupId}`);
  }
};

/**
 * 🚪 Disconnect cleanly
 */
export const disconnectWebSocket = () => {
  if (wsClient) {
    subscriptions.forEach((sub) => sub.unsubscribe());
    subscriptions.clear();
    wsClient.deactivate();
    wsClient = null;
    console.log('🔌 WebSocket disconnected');
  }
};


// // websocketManager.js
// import './fixSockJS';
// import './polyfills';
// import { Client } from '@stomp/stompjs';

// const API_URL = import.meta.env.VITE_API_URL || 'http://10.145.90.153:8082';

// let wsClient = null;
// const subscriptions = new Map();

// /**
//  * Dynamically import SockJS safely
//  */
// async function loadSockJS() {
//   console.log('[WebSocketManager] Loading SockJS...');
//   const { default: SockJS } = await import('sockjs-client');
//   console.log('[WebSocketManager] SockJS loaded ✅');
//   return SockJS;
// }

// /**
//  * 🔌 Connect WebSocket once per user session
//  * Keeps same API so no caller breaks.
//  */
// export const connectWebSocket = async (token, onConnect, onError) => {
//   if (wsClient && wsClient.connected) {
//     console.log('[WebSocketManager] Already connected');
//     return wsClient;
//   }

//   const SockJS = await loadSockJS();

//   wsClient = new Client({
//     // ✅ Use SockJS with your existing backend URL
//     webSocketFactory: () =>
//       new SockJS(`${API_URL}/api/ws?token=${encodeURIComponent(token)}`, null, {
//         transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
//       }),

//     connectHeaders: {
//       Authorization: `Bearer ${token}`,
//     },

//     reconnectDelay: 5000,
//     heartbeatIncoming: 10000,
//     heartbeatOutgoing: 10000,

//     debug: (msg) => console.debug('[STOMP Debug]', msg),

//     onConnect: (frame) => {
//       console.log('✅ Connected to WebSocket:', frame);
//       onConnect?.(true);
//     },

//     onStompError: (frame) => {
//       console.error('❌ STOMP protocol error:', frame);
//       onError?.('STOMP error: ' + frame.headers['message']);
//     },

//     onWebSocketError: (event) => {
//       console.error('❌ WebSocket error:', event);
//       onError?.('WebSocket transport error');
//     },

//     onWebSocketClose: (event) => {
//       console.warn('⚠️ WebSocket closed:', event.reason);
//       onConnect?.(false);
//     },
//   });

//   wsClient.activate();
//   return wsClient;
// };

// /**
//  * 👥 Subscribe to group-specific presence updates
//  */
// export const subscribeToGroup = (groupId, onPresenceUpdate) => {
//   if (!wsClient || !wsClient.connected) {
//     console.warn('[WebSocketManager] Not connected yet');
//     return;
//   }

//   if (subscriptions.has(groupId)) {
//     console.log(`[WebSocketManager] Already subscribed to group ${groupId}`);
//     return;
//   }

//   const destination = `/topic/group/${groupId}/membership-status`;
//   console.log(`🟢 Subscribing to ${destination}`);

//   const sub = wsClient.subscribe(destination, (message) => {
//     try {
//       const data = JSON.parse(message.body);
//       console.log(`📩 Presence update for group ${groupId}:`, data);
//       onPresenceUpdate?.(groupId, data);
//     } catch (err) {
//       console.error('[WebSocketManager] Error parsing presence update:', err);
//     }
//   });

//   subscriptions.set(groupId, sub);
// };

// /**
//  * 🔴 Unsubscribe from a specific group
//  */
// export const unsubscribeFromGroup = (groupId) => {
//   const sub = subscriptions.get(groupId);
//   if (sub) {
//     sub.unsubscribe();
//     subscriptions.delete(groupId);
//     console.log(`🔴 Unsubscribed from group ${groupId}`);
//   }
// };

// /**
//  * 🚪 Disconnect cleanly
//  */
// export const disconnectWebSocket = () => {
//   if (wsClient) {
//     subscriptions.forEach((sub) => sub.unsubscribe());
//     subscriptions.clear();
//     wsClient.deactivate();
//     wsClient = null;
//     console.log('🔌 WebSocket disconnected');
//   }
// };
