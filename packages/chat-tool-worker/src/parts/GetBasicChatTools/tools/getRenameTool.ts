import type { ChatTool } from '../../Types/Types.ts'

export const getRenameTool = (): ChatTool => {
  return {
    function: {
      description:
        'Rename or move a file or folder from one absolute URI to another absolute URI (for example `file://...`, `memfs://...`, or extension-provided file system URIs).',
      name: 'rename',
      parameters: {
        additionalProperties: false,
        properties: {
          newUri: {
            description: 'Absolute target URI for the file or folder after renaming.',
            type: 'string',
          },
          oldUri: {
            description: 'Absolute source URI for the existing file or folder to rename.',
            type: 'string',
          },
        },
        required: ['oldUri', 'newUri'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
