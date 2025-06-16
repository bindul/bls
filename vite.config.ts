import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {NodePackageImporter} from "sass-embedded";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-bootstrap-icons': ['react-bootstrap-icons'],
          'react-apexcharts': ['react-apexcharts', 'apexcharts'],
        }
      }
    },
  },
  // Silence Sass deprecation warnings. See note below.
  css: {
    preprocessorOptions: {
      scss: {
        importers: [ new NodePackageImporter() ],
        // includePaths: ['./node_modules/'],
        // See https://github.com/twbs/bootstrap/issues/40962
        silenceDeprecations: [
          'import',
          'mixed-decls',
          'color-functions',
          'global-builtin',
        ],
        api: "modern",
      },
    },
  },
})
