// const postcss = require('postcss')
import postcss from 'postcss'
// const autoprefixer = require('autoprefixer')
import autoprefixer from 'autoprefixer'
// const postcssPresetEnv = require('postcss-preset-env')
import postcssPresetEnv from 'postcss-preset-env'
import copyAssets from 'postcss-copy-assets';

import { sassPlugin, postcssModules } from 'esbuild-sass-plugin'
import * as esbuild from 'esbuild'
await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    write: true,
    outfile:'dist/index.js',
    format: 'esm',
    packages: 'external',
    sourcemap: 'linked',
    plugins: [
        sassPlugin({
            type:"style",
            cssImports: true,
            async transform(source, resolveDir) {
                const {css} = await postcss([autoprefixer, postcssPresetEnv({stage: 0})]).process(source, { from: resolveDir | undefined })
                return css
            }
            
        }
        )
    ]
  })


