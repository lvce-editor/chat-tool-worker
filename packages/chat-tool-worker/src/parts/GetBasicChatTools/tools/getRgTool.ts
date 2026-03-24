import type { ChatTool } from '../../Types/Types.ts'

export const getRgTool = (): ChatTool => {
  return {
    function: {
      description: 'Search text or regex in workspace files using ripgrep-style arguments and return matching results.',
      name: 'rg',
      parameters: {
        additionalProperties: false,
        properties: {
          '-n': {
            description: 'When true, include line numbers in the output.',
            type: 'boolean',
          },
          output_mode: {
            description: 'Result format to return.',
            enum: ['content', 'files_with_matches', 'count'],
            type: 'string',
          },
          path: {
            description: 'Optional file or directory path inside the current workspace to scope the search.',
            type: 'string',
          },
          pattern: {
            description: 'Text or regular expression pattern to search for.',
            type: 'string',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
