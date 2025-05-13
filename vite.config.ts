import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {NodePackageImporter} from "sass-embedded";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
