import type { ChatTool } from '../../Types/Types.ts'

export const getEditFileTool = (): ChatTool => {
  return {
    function: {
      description:
        'Apply a targeted text edit to an existing file by character offsets. This reads the current file, applies the edit, and writes the updated result. Use this for small changes instead of rewriting the full file.',
      name: 'edit_file',
      parameters: {
        additionalProperties: false,
        properties: {
          end: {
            description: 'Zero-based end character offset (exclusive) in the current file content.',
            type: 'number',
          },
          start: {
            description: 'Zero-based start character offset (inclusive) in the current file content.',
            type: 'number',
          },
          text: {
            description: 'Replacement text inserted at the range [start, end).',
            type: 'string',
          },
          uri: {
            description:
              'Absolute URI for the target file (for example `file://...`, `memfs://...`, or extension-provided file system URIs). Relative paths are not allowed.',
            type: 'string',
          },
        },
        required: ['uri', 'start', 'end', 'text'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
