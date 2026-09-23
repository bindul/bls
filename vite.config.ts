import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {NodePackageImporter} from "sass-embedded";

// https://vite.dev/config/
// https://rolldown.rs/reference/OutputOptions.codeSplitting
export default defineConfig({
  plugins: [react()],
  build: {
    minify: true,
    rolldownOptions : {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'libs',
              test: /node_modules/,
              minSize: 250000,
              maxSize: 500000,
              priority: 10,
            },
          ]
        }
      }
    },
  },
  // Silence Sass deprecation warnings. See note below.
  css: {
    preprocessorOptions: {
      scss: {
          // includePaths: ['./node_modules/'],
          // See https://github.com/twbs/bootstrap/issues/40962
          // See https://github.com/twbs/bootstrap/issues/41915
          importers: [new NodePackageImporter()],
          loadPaths: ['./node_modules/'],
          silenceDeprecations: [
              'import',
              //'mixed-decls',
              'color-functions',
              'global-builtin',
              'if-function',
          ],
      },
    },
  },
})
