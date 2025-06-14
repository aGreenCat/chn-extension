import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [
		react(),
	],
	build: {
		rollupOptions: {
			input: {
				main: './index.html',
				content: 'src/content/content.ts',
			},
			output: {
				entryFileNames: '[name].js',
				assetFileNames: '[name].[ext]',
				chunkFileNames: '[name].js',
			},
		},
	},
})
