// // src/fixSockJS.js
// import cryptoBrowserify from 'crypto-browserify';

// console.log('[FixSockJS] Applying randomBytes patch...');

// // Make sure a crypto object exists
// if (typeof globalThis.crypto === 'undefined') {
//   globalThis.crypto = {};
// }

// // Inject randomBytes if missing (used by SockJS)
// if (typeof globalThis.crypto.randomBytes !== 'function') {
//   globalThis.crypto.randomBytes = (size) => {
//     const array = new Uint8Array(size);
//     (globalThis.crypto.getRandomValues || ((arr) => {
//       // fallback: pseudo-random
//       for (let i = 0; i < arr.length; i++) {
//         arr[i] = Math.floor(Math.random() * 256);
//       }
//     }))(array);
//     return array;
//   };
// }

// console.log('[FixSockJS] crypto.randomBytes patched ✅');
