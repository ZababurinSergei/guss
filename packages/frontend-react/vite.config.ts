import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,
        host: true,
        cors: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3012',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (_proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from Target:', proxyRes.statusCode, req.url);
                    });
                }
            }
        }
    },
    build: {
        target: 'es2022',
        minify: 'esbuild',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                },
            },
        },
        outDir: '../public',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    esbuild: {
        target: 'es2022',
    },
    // Добавляем настройки для правильного обслуживания index.html
    root: '.',
    publicDir: 'public',
})