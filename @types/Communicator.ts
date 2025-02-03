import { NormalResult } from "."

export type WatchInfo = {
  watchName: string
  watchVersion: string
  isPaired: boolean
  isReachable: boolean
  isWatchAppInstalled: boolean
}

export interface CommunicatorType {
  fetchWatchSupportWithCallback(callback: (watchInfo: NormalResult<WatchInfo>) => void): void
  sendDataToWatch(data: string, callback: (watchInfo: NormalResult<WatchInfo>) => void): void
}

export type WatchSyncProps = {
  info: WatchInfo
}

export type WatchMessageHandler = {
  isLoggedIn: boolean
}
