import type { ChatTool } from '../../Types/Types.ts'

export const getUpdateTodoTool = (): ChatTool => {
  return {
    function: {
      description:
        'Update the active TODO checklist for the current chat session. Pass the full markdown checklist text with one item per line (for example "- [ ] Step one").',
      name: 'update_todo',
      parameters: {
        additionalProperties: false,
        properties: {
          todos: {
            description: 'Complete markdown checklist content to store as the current TODO list state.',
            type: 'string',
          },
        },
        required: ['todos'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
