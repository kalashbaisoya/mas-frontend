import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import path

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname), // Explicitly set to project root
  // css: {
  //   postcss: {
  //     plugins: [
  //       require('tailwindcss'),
  //       require('autoprefixer'),
  //     ],
  //   },
  // },
  server: {
    base: '/start/',
    host: '0.0.0.0', // Exposes server on network
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// export default defineConfig({
//   plugins: [react()],
//   root: path.resolve(__dirname),
//   define: {
//     global: 'window',
//     'process.env': {}, // Prevent process.env crashes
//   },
//   resolve: {
//     alias: {
//       // Polyfills for Node modules
//       stream: 'stream-browserify',
//       crypto: 'crypto-browserify',
//       path: 'path-browserify',
//       util: 'util',
//       buffer: 'buffer',
//     },
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       define: {
//         global: 'window',
//       },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           buffer: true,
//           process: true,
//         }),
//         NodeModulesPolyfillPlugin(),
//       ],
//     },
//   },
//   server: {
//     base: '/start/',
//     host: '0.0.0.0',
//     port: 5173,
//     strictPort: true,
//   },
//   build: {
//     outDir: 'dist',
//   },
// });


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// export default defineConfig({
//   plugins: [react()],
//   root: path.resolve(__dirname),
//   define: {
//     global: 'window',
//     'process.env': {},
//   },
// resolve: {
//     alias: {
//     crypto:  'crypto-browserify',
//     stream: 'rollup-plugin-node-polyfills/polyfills/stream',
//     buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
//     process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
//   },
//   },
// optimizeDeps: {
//   include: ['crypto-browserify', 'stream-browserify', 'buffer', 'process'],
//   esbuildOptions: {
//     define: {
//       global: 'window',
//     },
//     plugins: [
//       NodeGlobalsPolyfillPlugin({
//         buffer: true,
//         process: true,
//       }),
//       NodeModulesPolyfillPlugin(),
//     ],
//   },
// },

//   server: {
//     base: '/start/',
//     host: '0.0.0.0',
//     port: 5173,
//     strictPort: true,
//   },
//   build: {
//     outDir: 'dist',
//   },
// });


