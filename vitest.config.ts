import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./client/src/test/setup.ts'],
        testTimeout: 30000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './client/src'),
        },
    },
});
