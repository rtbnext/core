import { build } from 'esbuild';
import { dtsPlugin } from 'esbuild-plugin-d.ts';


await build( {
  plugins: [ dtsPlugin() ],
  entryPoints: [ 'src/**/*.ts' ],
  outbase: 'src',
  outdir: 'dist',
  format: 'esm',
  bundle: false,
  platform: 'neutral',
  target: 'esnext',
  sourcemap: false,
  legalComments: 'none',
  minify: false,
  treeShaking: true
} );
