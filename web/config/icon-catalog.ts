import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const catalog = JSON.parse(
  readFileSync(require.resolve('@lobehub/icons/es/toc.json'), 'utf8')
) as typeof import('@lobehub/icons/es/toc').toc

// Filter at build time so removed branding is absent from the shipped catalog.
export const picoIconCatalog = catalog.filter((icon) => icon.id !== 'NewAPI')
