import type { ChatTool } from '../../Types/Types.ts'

export const getClosePreviewTool = (): ChatTool => {
  return {
    function: {
      description: 'Close the right-side preview if it is currently open.',
      name: 'close_preview',
      parameters: {
        additionalProperties: false,
        properties: {},
        type: 'object',
      },
    },
    type: 'function',
  }
}
