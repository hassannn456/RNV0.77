const fs = require('fs')
const src_dir = 'content/html'
const out_dir = 'build'

let html_gen_ts = ''

for (const file of fs.readdirSync(src_dir)) {
  const bundle = fs.readFileSync(`${src_dir}/${file}`, 'utf8')
  const escaped = JSON.stringify(bundle)
  html_gen_ts += `export const ${file.replace(
    '.html',
    'Html',
  )} = ${escaped}\n\n`
}

fs.writeFileSync(`${out_dir}/html.ts`, html_gen_ts)
