import { expect, test } from '@jest/globals'
import { executeUpdateTodoTool } from '../src/parts/ExecuteUpdateTodoTool/ExecuteUpdateTodoTool.ts'

const options = {
  assetDir: '',
  platform: 0,
}

test('executeUpdateTodoTool returns error when todos is missing', async () => {
  const result = await executeUpdateTodoTool({}, options)
  expect(result).toEqual({ error: 'Missing required argument: todos' })
})

test('executeUpdateTodoTool stores todos in memory fallback when persistent storage is unavailable', async () => {
  const result = await executeUpdateTodoTool({ todos: '- [ ] Add tests' }, options)
  expect(result).toEqual({
    message: 'TODO list updated',
    ok: true,
    previousTodos: '',
    storage: 'memory',
    todos: '- [ ] Add tests',
  })
})

test('executeUpdateTodoTool returns previous memory todos on subsequent update', async () => {
  await executeUpdateTodoTool({ todos: '- [ ] First item' }, options)
  const result = await executeUpdateTodoTool({ todos: '- [x] First item' }, options)
  expect(result).toEqual({
    message: 'TODO list updated',
    ok: true,
    previousTodos: '- [ ] First item',
    storage: 'memory',
    todos: '- [x] First item',
  })
})
