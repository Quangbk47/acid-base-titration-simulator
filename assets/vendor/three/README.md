# Three.js 0.186.1

Source: npm package `three@0.186.1`, https://github.com/mrdoob/three.js.
License: MIT, preserved in `LICENSE`.

The core WebGL ES modules and the OrbitControls/RoomEnvironment addons are
served locally. Addon imports are changed from the bare `three` specifier to
`./three.module.js` so this static ES module project needs no bundler or CDN.
Only the experiment viewport dynamically imports these files.

The four JavaScript files are minified with esbuild 0.28.2. Combined size is
approximately 770 KiB before HTTP compression. Package manager files are unchanged.
