import type { ChatTool } from '../../Types/Types.ts'

export const getGlobTool = (): ChatTool => {
  return {
    function: {
      description:
        'Find files by glob pattern under a specific workspace folder URI and return matching relative paths. If you do not already have a real workspace URI, call getWorkspaceUri first and then pass that returned workspaceUri as baseUri.',
      name: 'glob',
      parameters: {
        additionalProperties: false,
        properties: {
          baseUri: {
            description:
              'Absolute folder URI for the workspace root or subfolder where the glob search should start. If unknown, call getWorkspaceUri first and pass the returned workspaceUri value.',
            type: 'string',
          },
          pattern: {
            description: 'Glob pattern to match files, for example `packages/e2e/src/*.ts`.',
            type: 'string',
          },
        },
        required: ['baseUri', 'pattern'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
