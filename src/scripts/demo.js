const fs = require('fs')

/** Find all *.demo.json in directory */
const find_all_demo_json = dir => {
  let demo_paths = []
  for (const file of fs.readdirSync(dir)) {
    const path = `${dir}/${file}`
    const isDirectory = fs.lstatSync(path).isDirectory()
    if (isDirectory) {
      demo_paths = demo_paths.concat(find_all_demo_json(path))
    } else if (path.endsWith('.demo.json')) {
      demo_paths.push({
        endpoint: file.replaceAll('_', '/').replace('.demo', ''),
        path,
        file,
        dir: dir.replace(src_dir, '').replace('/', ''),
      })
    }
  }
  return demo_paths
}

/** Generate demo helper code */
const write_demo_gen_ts = demo_paths => {
  fs.mkdirSync(build_dir, { recursive: true })
  var demo_gen_ts = ''
  const out = s => {
    demo_gen_ts += `${s}\n`
  }
  out('export interface DemoPayload {')
  out('\tsuccess: boolean')
  out('\terrorCode?: string')
  out('\tdataName?: string')
  out('\tdata?: unknown')
  out('}')
  out('')
  out(
    'export const demoPayload = (endpoint: string, overrideFolder: string): DemoPayload | undefined => {',
  )
  out('\tswitch (endpoint) {')
  for (const path of demo_paths) {
    if (path.dir != '') {
      continue
    }
    out(`\t\tcase '${path.endpoint}':`)
    const endpoint_paths = demo_paths.filter(p => p.endpoint == path.endpoint)
    if (endpoint_paths.length > 1) {
      out(`\t\t\tswitch (overrideFolder) {`)
      for (const endpoint_path of endpoint_paths) {
        out(`\t\t\t\tcase "${endpoint_path.dir}":`)
        out(
          `\t\t\t\t\treturn require('../${endpoint_path.path}') as DemoPayload`,
        )
      }
      out(`\t\t\t}`)
    } else {
      out(`\t\t\treturn require('../${path.path}') as DemoPayload`)
    }
  }
  out('\t\tdefault:')
  out(
    '\t\t\tconsole.warn(`Expected demo mock for endpoint ${endpoint} not found!`)',
  )
  out('\t\t\treturn undefined')
  out('\t}')
  out('}')
  out('')
  fs.writeFileSync(`${build_dir}/demo.ts`, demo_gen_ts)
}

const build_dir = 'build'
const src_dir = 'src/api/demo'
const demo_paths = find_all_demo_json(src_dir, '')
find_all_demo_json(src_dir, '')
write_demo_gen_ts(demo_paths)
