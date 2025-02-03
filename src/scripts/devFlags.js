const fs = require('fs')
const readline = require('readline')
const path = 'devFlags.json'

//  create empty object json file if it doesn't exist
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, '{}', 'utf8')
  console.log(`${path} created.`)
}
// read, parse, get keys
const data = fs.readFileSync(path, 'utf8')
const parsedFlags = JSON.parse(data)
const flags = Object.keys(parsedFlags)

// filter active flags
const activeFlags = flags.filter(key => parsedFlags[key] === true)
if (activeFlags.length > 0) {
  console.log('\n\n\x1b[31mHEY!!!\x1b[0m\n\n')
  console.log('\x1b[31mYOU HAVE ACTIVE LOCAL DEV FLAGS\x1b[0m\n')
  activeFlags.forEach(flag => console.log(`\x1b[31m  - ${flag}\x1b[0m`))
  console.log(
    '\n\n\x1b[31mMAKE SURE YOU REALLY WANT TO RUN A BUILD WITH THESE FLAGS ON!! \x1b[0m\n\n',
  )
  console.log(
    '\n\n\x1b[31mUpdate devFlags.json if you are doing a prod build!! \x1b[0m\n\n',
  )
}
