import type { ChatTool } from '../../Types/Types.ts'

export const getSearchTextTool = (): ChatTool => {
  return {
    function: {
      description: 'Search text in workspace files using query options and return matching results.',
      name: 'search_text',
      parameters: {
        additionalProperties: false,
        properties: {
          options: {
            additionalProperties: false,
            properties: {
              exclude: {
                items: {
                  type: 'string',
                },
                type: 'array',
              },
              isRegex: {
                type: 'boolean',
              },
              matchCase: {
                type: 'boolean',
              },
              matchWholeWord: {
                type: 'boolean',
              },
              value: {
                type: 'string',
              },
            },
            required: ['value', 'isRegex', 'matchCase', 'matchWholeWord', 'exclude'],
            type: 'object',
          },
        },
        required: ['options'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
