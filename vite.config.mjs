// vite.config.mjs
// Plugins
import Components from 'unplugin-vue-components/vite';
import Vue from '@vitejs/plugin-vue';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
 root: '.',
 plugins: [
  Vue({
   template: { transformAssetUrls }
  }),
  Vuetify(),
  Components()
 ],
 define: { 'process.env': {} },
 resolve: {
  alias: {
   '@type': fileURLToPath(new URL('./src/type.ts', import.meta.url)),
   '@common': fileURLToPath(new URL('./src/common', import.meta.url)),
   '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
   '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
   '@store': fileURLToPath(new URL('./src/store', import.meta.url))
  },
  extensions: ['.ts', '.js', '.json', '.jsx', '.mjs', '.tsx', '.vue'],
  esbuild: {
   tsconfig: './tsconfig.json'
  }
 },

 build: {
  minify: false, // ミニファイを無効化
  lib: {
   entry: {
    test: 'src/main.ts'
   },
   formats: ['es', 'cjs', 'umd', 'iife'], // ESモジュールとUMD形式で出力
   fileName: (format, entryName) => `${entryName}.${format}.js`,
   name: 'MyLibrary' // グローバル変数名を指定（任意の名前）
  },
  rollupOptions: {
   external: ['vue', 'vuetify'],
   output: {
    globals: {
     vue: 'Vue',
     vuetify: 'Vuetify'
    }
   }
  },
  sourcemap: true // ソースマップを生成
 },
 server: {
  port: 3000,
  proxy: {
   '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false
   }
  }
 }
});
