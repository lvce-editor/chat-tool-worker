import { createMockRpc, type MockRpc, type Rpc } from '@lvce-editor/rpc'
import { RpcId, get as getRpc, remove as removeRpc, set as setRpc } from '@lvce-editor/rpc-registry'

export const invoke = (method: string, ...params: readonly unknown[]): Promise<unknown> => {
  const rpc = getRpc(RpcId.TerminalProcess)
  return rpc.invoke(method, ...params)
}

export const registerMockRpc = (commandMap: Record<string, any>): MockRpc => {
  const mockRpc = createMockRpc({ commandMap })
  setRpc(RpcId.TerminalProcess, mockRpc)
  Object.defineProperty(mockRpc, Symbol.dispose, {
    configurable: true,
    value: () => {
      removeRpc(RpcId.TerminalProcess)
    },
  })
  return mockRpc
}

export const set = (rpc: Rpc): void => {
  setRpc(RpcId.TerminalProcess, rpc)
}
