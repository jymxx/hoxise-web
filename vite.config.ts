import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite' //css样式组件

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'], // 自动导入 Vue 的所有 API
      dts: 'types/auto-imports.d.ts', // 生成类型声明文件
    }),
    tailwindcss(), //css样式组件
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 80,
    open: true,
  },
  build: {
    outDir: 'hoxise-web',
  },
})
