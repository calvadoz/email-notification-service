const { build } = require('esbuild')

build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  tsconfig: 'tsconfig.json'
}).catch((err) => {
  console.error('Build failed ', err)
  process.exit(1)
})
