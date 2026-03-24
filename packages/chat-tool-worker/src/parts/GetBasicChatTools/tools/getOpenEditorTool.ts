import type { ChatTool } from '../../Types/Types.ts'

export const getOpenEditorTool = (): ChatTool => {
  return {
    function: {
      description: 'Open a file URI in the editor.',
      name: 'openEditor',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description: 'Absolute file URI for a real path inside the currently open workspace folder. Do not use placeholder URIs.',
            type: 'string',
          },
        },
        required: ['uri'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
