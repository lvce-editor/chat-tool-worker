import type { ChatTool } from '../../Types/Types.ts'

export const getRunInTerminalTool = (): ChatTool => {
  return {
    function: {
      description: 'Run a shell command in a terminal using the provided shell and command options.',
      name: 'run_in_terminal',
      parameters: {
        additionalProperties: false,
        properties: {
          options: {
            additionalProperties: false,
            properties: {
              command: {
                type: 'string',
              },
              shell: {
                type: 'string',
              },
            },
            required: ['shell', 'command'],
            type: 'object',
          },
        },
        required: ['options'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
