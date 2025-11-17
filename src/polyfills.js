import { Buffer } from 'buffer';
import process from 'process';
import cryptoBrowserify from 'crypto-browserify';

console.log('[Polyfill] Initializing...');

setTimeout(() => {
  try {
    if (!globalThis.Buffer) {
      globalThis.Buffer = Buffer;
      console.log('[Polyfill] Added Buffer');
    }

    if (!globalThis.process) {
      globalThis.process = process;
      console.log('[Polyfill] Added process');
    }

    // --- crypto ---
    if (!globalThis.crypto || !globalThis.crypto.randomBytes) {
      // Replace if totally missing
      globalThis.crypto = cryptoBrowserify;
      console.log('[Polyfill] crypto-browserify assigned fully');
    } else {
      // Patch native crypto to include randomBytes
      if (typeof globalThis.crypto.randomBytes !== 'function') {
        console.log('[Polyfill] Injecting randomBytes shim into native crypto');
        globalThis.crypto.randomBytes = function (size) {
          return cryptoBrowserify.randomBytes(size);
        };
      }
    }

    console.log('[Polyfill Check]', {
      hasBuffer: !!globalThis.Buffer,
      hasProcess: !!globalThis.process,
      hasCrypto: !!globalThis.crypto,
      hasRandomBytes: !!globalThis.crypto?.randomBytes,
    });
  } catch (err) {
    console.error('[Polyfill Error]', err);
  }
}, 0);
