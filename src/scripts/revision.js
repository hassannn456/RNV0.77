const { exec } = require('child_process')
const fs = require('fs')

async function getCommitStub() {
  return new Promise((resolve, reject) => {
    if (process.env.JENKINS_HOME) {
      // Jenkins version, env vars
      const stub = process.env.GIT_COMMIT?.substring(0, 7)
      if (!stub) {
        reject(`Error: GIT_COMMIT not found!`)
      } else {
        resolve(stub)
      }
      return
    } else if (process.env.CI_WORKSPACE) {
      // XCode Cloud version, env vars
      const stub = process.env.CI_COMMIT?.substring(0, 7)
      if (!stub) {
        reject(`Error: CI_COMMIT not found!`)
      } else {
        resolve(stub)
      }
      return
    } else {
      // Local Version, ask git
      const command = 'git rev-parse HEAD'
      exec(command, (exec_error, stdout, stderr) => {
        if (exec_error) {
          reject(`exec '${command}' failed with error: ${exec_error.message}`)
          return
        }
        if (stderr) {
          console.warn(`git describe stderr: ${stderr}`)
        }
        resolve(stdout.split('\n')[0]?.substring(0, 7))
        return
      })
    }
  })
}

async function main() {
  return new Promise(async (resolve, reject) => {
    try {
      const stub = await getCommitStub()
      if (!stub) {
        reject(`Failed to get commit hash!`)
        return
      }
      const version = process.env.npm_package_version
      if (!version) {
        reject(`Error: npm_package_version not found!`)
        return
      }
      const json = JSON.stringify({ version: version, ref: stub }, undefined, 2)
      fs.writeFile('build/revision.json', json, io_error => {
        if (io_error) {
          reject(`file write failed with error: ${io_error.message}`)
        } else {
          resolve(version) // Print version to console
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

main().then(console.log).catch(console.error)
