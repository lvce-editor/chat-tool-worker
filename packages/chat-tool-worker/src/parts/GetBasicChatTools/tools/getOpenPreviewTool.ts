import type { ChatTool } from '../../Types/Types.ts'

export const getOpenPreviewTool = (): ChatTool => {
  return {
    function: {
      description: 'Open the right-side preview for an HTML file URI inside the currently open workspace folder.',
      name: 'open_preview',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description: 'Absolute HTML file URI for a real path inside the currently open workspace folder. Do not use placeholder URIs.',
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
