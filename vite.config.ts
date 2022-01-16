import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './src/FormValidator.ts',
            name: 'FormValidator'
        }
    }
});