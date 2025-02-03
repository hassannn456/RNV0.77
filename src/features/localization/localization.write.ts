import {
  DocumentDirectoryPath,
  exists,
  mkdir,
  readFile,
  writeFile,
} from 'react-native-fs'
import { trackError } from '../../components/useTracking'

const getLocalPath: (path: string) => string = path => {
  const localDirectoryPath = `${DocumentDirectoryPath}/localizations`
  if (path.startsWith(localDirectoryPath)) {
    return path
  } else {
    return `${localDirectoryPath}/${path}`
  }
}

export const fileExists: (path: string) => Promise<boolean> = async path => {
  const localPath = getLocalPath(path)
  try {
    return await exists(localPath)
  } catch (error) {
    trackError('localization.write.ts::fileExists')(error)
    throw error
  }
}

export const readFromFile: (path: string) => Promise<string> = async path => {
  try {
    const localPath = getLocalPath(path)
    if (await fileExists(localPath)) {
      return await readFile(localPath, 'utf8')
    }
  } catch (error) {
    trackError('localization.write.ts::readFromFile')(error)
  }
  return ''
}

export const createDirectory: (path: string) => Promise<void> = async path => {
  const localPath = getLocalPath(path)
  return await mkdir(localPath).catch(error => {
    trackError('localization.write.ts::createDirectory')(error)
  })
}

export const writeToFile: (
  path: string,
  data: string,
  createIntermediates?: boolean,
) => Promise<void> = async (path, data, createIntermediates) => {
  const localPath = getLocalPath(path)
  try {
    if (createIntermediates) {
      const directory = localPath.slice(0, localPath.lastIndexOf('/'))
      await createDirectory(directory)
    }
    return await writeFile(localPath, data, 'utf8')
  } catch (error) {
    trackError('localization.write.ts::writeToFile')(error)
    throw error
  }
}
