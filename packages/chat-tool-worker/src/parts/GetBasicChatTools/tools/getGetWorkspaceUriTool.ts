import type { ChatTool } from '../../Types/Types.ts'

export const getGetWorkspaceUriTool = (): ChatTool => {
  return {
    function: {
      description:
        'Get the URI of the currently open workspace folder. Call this first before using list_files, read_file, write_file, edit_file, open_preview, or openEditor when you do not already have a concrete workspace URI.',
      name: 'getWorkspaceUri',
      parameters: {
        additionalProperties: false,
        properties: {},
        type: 'object',
      },
    },
    type: 'function',
  }
}
