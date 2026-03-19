import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'

const todoDbName = 'chat-tool-worker'
const todoStoreName = 'state'
const todoKey = 'todoList'
const todoCacheName = 'chat-tool-worker-todo'
const todoCacheRequest = new Request('https://chat-tool-worker.local/todo-list')

let memoryTodoList = ''

const setTodosInIndexedDb = async (todos: string): Promise<void> => {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const openRequest = indexedDB.open(todoDbName, 1)
    openRequest.onupgradeneeded = (): void => {
      const nextDb = openRequest.result
      if (!nextDb.objectStoreNames.contains(todoStoreName)) {
        nextDb.createObjectStore(todoStoreName)
      }
    }
    openRequest.onsuccess = (): void => {
      resolve(openRequest.result)
    }
    openRequest.onerror = (): void => {
      reject(openRequest.error ?? new Error('Failed to open IndexedDB'))
    }
  })

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(todoStoreName, 'readwrite')
    transaction.objectStore(todoStoreName).put(todos, todoKey)
    transaction.oncomplete = (): void => {
      db.close()
      resolve()
    }
    transaction.onerror = (): void => {
      db.close()
      reject(transaction.error ?? new Error('Failed to persist todo list'))
    }
    transaction.onabort = (): void => {
      db.close()
      reject(transaction.error ?? new Error('Failed to persist todo list'))
    }
  })
}

const setTodosInCacheStorage = async (todos: string): Promise<void> => {
  const cache = await caches.open(todoCacheName)
  const payload = JSON.stringify({ todos })
  await cache.put(
    todoCacheRequest,
    new Response(payload, {
      headers: {
        'content-type': 'application/json',
      },
    }),
  )
}

export const executeUpdateTodoTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const todos = typeof args.todos === 'string' ? args.todos : ''
  if (!todos) {
    return { error: 'Missing required argument: todos' }
  }

  try {
    if (typeof indexedDB !== 'undefined') {
      await setTodosInIndexedDb(todos)
      return { message: 'TODO list updated', ok: true, storage: 'indexeddb', todos }
    }

    if (typeof caches !== 'undefined') {
      await setTodosInCacheStorage(todos)
      return { message: 'TODO list updated', ok: true, storage: 'cache', todos }
    }

    const previousTodos = memoryTodoList
    memoryTodoList = todos
    return { message: 'TODO list updated', ok: true, previousTodos, storage: 'memory', todos }
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
