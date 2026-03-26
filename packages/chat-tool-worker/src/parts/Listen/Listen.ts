import { initializeChatStorageWorker } from '../InitializeChatStorageWorker/InitializeChatStorageWorker.ts'
import { initializeFileSystemWorker } from '../InitializeFileSystemWorker/InitializeFileSystemWorker.ts'
import { initializeRendererWorker } from '../InitializeRendererWorker/InitializeRendererWorker.ts'

export const listen = async (): Promise<void> => {
  await Promise.all([initializeRendererWorker(), initializeFileSystemWorker(), initializeChatStorageWorker()])
}
