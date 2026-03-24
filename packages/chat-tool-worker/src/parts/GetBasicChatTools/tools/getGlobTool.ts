import type { ChatTool } from '../../Types/Types.ts'

export const getGlobTool = (): ChatTool => {
  return {
    function: {
      description: 'Find files by glob pattern and return matching relative paths.',
      name: 'glob',
      parameters: {
        additionalProperties: false,
        properties: {
          pattern: {
            description: 'Glob pattern to match files, for example `packages/e2e/src/*.ts`.',
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
