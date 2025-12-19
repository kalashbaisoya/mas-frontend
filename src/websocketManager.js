
// websocketManager.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://10.14.75.10:8082/backend';

let wsClient = null;

// Presence subscriptions (membership online/offline)
const presenceSubscriptions = new Map();

// Authentication / challenge subscriptions
const authSubscriptions = new Map();

/**
 * 🔌 Connect WebSocket once per user session
 */
export const connectWebSocket = (token, onConnect, onError) => {
  if (wsClient && wsClient.connected) return wsClient;

  wsClient = new Client({
    webSocketFactory: () =>
      new SockJS(
        `${API_URL}/api/ws?token=${encodeURIComponent(token)}`,
        null,
        {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        }
      ),

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
      console.error('❌ STOMP error:', frame);
      onError?.(frame.headers['message']);
    },

    onWebSocketError: (event) => {
      console.error('❌ WebSocket error:', event);
      onError?.('WebSocket error');
    },

    onWebSocketClose: () => {
      console.warn('⚠️ WebSocket closed');
      onConnect?.(false);
    },
  });

  wsClient.activate();
  return wsClient;
};

/**
 * 👥 Subscribe to group presence (online/offline + authIntent)
 */
export const subscribeToGroupPresence = (groupId, onPresenceUpdate) => {
  if (!wsClient?.connected) return;

  if (presenceSubscriptions.has(groupId)) return;

  const destination = `/topic/group/${groupId}/membership-status`;

  const sub = wsClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onPresenceUpdate?.(payload);
    } catch (e) {
      console.error('Presence payload parse error', e);
    }
  });

  presenceSubscriptions.set(groupId, sub);
};

/**
 * 🔐 Subscribe to authentication / challenge state updates
 *
 * Used for:
 * - ACTIVE challenge timer
 * - verifiedCount updates
 * - COMPLETED / EXPIRED / CANCELLED
 *
 * NOT used for Type A UI (you already decided)
 */
export const subscribeToGroupAuthState = (groupId, onAuthStateUpdate) => {
  if (!wsClient?.connected) return;

  if (authSubscriptions.has(groupId)) return;

  const destination = `/topic/group/${groupId}/auth-state`; // ✅ FIXED

  console.log(`🔐 Subscribing to auth state: ${destination}`);

  const sub = wsClient.subscribe(destination, (message) => {
    try {
      const payload = JSON.parse(message.body);
      onAuthStateUpdate?.(payload);
    } catch (e) {
      console.error('Auth state payload parse error', e);
    }
  });

  authSubscriptions.set(groupId, sub);
};


/**
 * 🔴 Unsubscribe from presence updates
 */
export const unsubscribeFromGroupPresence = (groupId) => {
  const sub = presenceSubscriptions.get(groupId);
  if (sub) {
    sub.unsubscribe();
    presenceSubscriptions.delete(groupId);
  }
};

/**
 * 🔴 Unsubscribe from authentication updates
 */
export const unsubscribeFromGroupAuthState = (groupId) => {
  const sub = authSubscriptions.get(groupId);
  if (sub) {
    sub.unsubscribe();
    authSubscriptions.delete(groupId);
  }
};

/**
 * 🚪 Disconnect cleanly
 */
export const disconnectWebSocket = () => {
  presenceSubscriptions.forEach((sub) => sub.unsubscribe());
  authSubscriptions.forEach((sub) => sub.unsubscribe());

  presenceSubscriptions.clear();
  authSubscriptions.clear();

  if (wsClient) {
    wsClient.deactivate();
    wsClient = null;
  }

  console.log('🔌 WebSocket disconnected');
};
 



// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// const API_URL = process.env.REACT_APP_API_URL || 'http://10.14.75.10:8082/backend';

// let wsClient = null;
// const subscriptions = new Map();

// /**
//  * 🔌 Connect WebSocket once per user session
//  */
// export const connectWebSocket = (token, onConnect, onError) => {
//   if (wsClient && wsClient.connected) return wsClient;

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

//     debug: (msg) => console.debug('STOMP Debug:', msg),

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
// export const subscribeToGroupPresence = (groupId, onPresenceUpdate) => {
//   if (!wsClient || !wsClient.connected) {
//     console.warn('WebSocket not connected yet');
//     return;
//   }

//   if (subscriptions.has(groupId)) {
//     console.log(`Already subscribed to group ${groupId}`);
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
//       console.error('Error parsing presence update:', err);
//     }
//   });

//   subscriptions.set(groupId, sub);
// };

// /**
//  * 🔴 Unsubscribe from a specific group
//  */
// export const unsubscribeFromGroupPresence = (groupId) => {
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


// // websocketManager.js
// import './fixSockJS';
// import './polyfills';
// import { Client } from '@stomp/stompjs';

// const API_URL = import.meta.env.VITE_API_URL || 'http://10.14.75.10:8082';

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
// export const subscribeToGroupPresence = (groupId, onPresenceUpdate) => {
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
// export const unsubscribeFromGroupPresence = (groupId) => {
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
