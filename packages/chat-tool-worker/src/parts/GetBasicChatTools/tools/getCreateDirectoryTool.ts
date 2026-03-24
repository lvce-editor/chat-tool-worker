import type { ChatTool } from '../../Types/Types.ts'

export const getCreateDirectoryTool = (): ChatTool => {
  return {
    function: {
      description:
        'Create a new directory at the given absolute URI (for example `file://...`, `memfs://...`, or extension-provided file system URIs). Do not pass a relative path.',
      name: 'create_directory',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description:
              'Absolute URI for the target directory (for example `file://...`, `memfs://...`, or extension-provided file system URIs). Relative paths are not allowed.',
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
