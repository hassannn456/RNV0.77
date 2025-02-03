const fs = require('fs')
const path = require('path')

const filePath = path.join('environments.json')
const environments = JSON.parse(fs.readFileSync(filePath, 'utf8'))

const featureFlagKeys = environments.reduce((acc, env) => {
  if (env.featureFlags) {
    Object.keys(env.featureFlags).forEach(key => {
      acc[key] = true
    })
  }
  return acc
}, {})

fs.writeFileSync('featureFlags.json', JSON.stringify(featureFlagKeys, null, 2))
