import { initializeTerminalProcess } from '../InitializeTerminalProcess/InitializeTerminalProcess.ts'

export const initialize = async (platform: number): Promise<void> => {
  // TODO
  await initializeTerminalProcess(platform)
}
