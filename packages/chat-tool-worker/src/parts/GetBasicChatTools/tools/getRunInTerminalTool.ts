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
                description: 'The shell command to execute.',
                type: 'string',
              },
              explanation: {
                description: 'Why this terminal command is being run.',
                type: 'string',
              },
              goal: {
                description: 'The higher-level objective this terminal command is meant to achieve.',
                type: 'string',
              },
              shell: {
                description: 'The shell executable that should run the command.',
                type: 'string',
              },
            },
            required: ['shell', 'command', 'explanation', 'goal'],
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
