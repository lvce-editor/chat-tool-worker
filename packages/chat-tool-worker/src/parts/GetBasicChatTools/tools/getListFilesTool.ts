import type { ChatTool } from '../../Types/Types.ts'

export const getListFilesTool = (): ChatTool => {
  return {
    function: {
      description:
        'List direct children (files and folders) for a folder URI inside the currently open workspace folder. If you do not already have a real workspace URI, call getWorkspaceUri first and then use that returned URI. Do not use placeholder URIs like file:///workspace.',
      name: 'list_files',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description:
              'Absolute folder URI for a real path inside the currently open workspace folder. If unknown, call getWorkspaceUri first and pass the returned workspaceUri value. Do not use placeholder URIs.',
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
