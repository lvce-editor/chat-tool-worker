import type { ChatTool } from '../../Types/Types.ts'

export const getWriteFileTool = (): ChatTool => {
  return {
    function: {
      description:
        'Write UTF-8 text content to a file for an absolute URI (for example `file://...`, `memfs://...`, or extension-provided file system URIs). Do not pass a relative path and do not use a `path` argument.',
      name: 'write_file',
      parameters: {
        additionalProperties: false,
        properties: {
          content: {
            description: 'New UTF-8 text content to write to the file.',
            type: 'string',
          },
          uri: {
            description:
              'Absolute URI for the target file (for example `file://...`, `memfs://...`, or extension-provided file system URIs). Relative paths are not allowed.',
            type: 'string',
          },
        },
        required: ['uri', 'content'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
