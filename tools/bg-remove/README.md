# Photo cleaner (vendor portal)

`background-removal-1.4.5.min.mjs` is an unmodified browser bundle of the open-source
[@imgly/background-removal](https://github.com/imgly/background-removal-js) 1.4.5 (AGPL-3.0, see LICENSE.md)
with its dependencies (onnxruntime-web, lodash-es, ndarray, zod; MIT).
Rebuild: `echo 'export {removeBackground} from "@imgly/background-removal";' > e.js && npx esbuild e.js --bundle --format=esm --minify`.
The AI model files load from imgly's CDN (staticimgly.com) the first time a seller cleans a photo.
