import type { ChatTool } from '../Types/Types.ts'

const getReadFileTool = (): ChatTool => {
  return {
    function: {
      description: 'Read UTF-8 text content from a file inside the currently open workspace folder. Only pass an absolute URI.',
      name: 'read_file',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description: 'Absolute file URI within the workspace (for example: file:///workspace/src/index.ts).',
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

const getWriteFileTool = (): ChatTool => {
  return {
    function: {
      description: 'Write UTF-8 text content to a file inside the currently open workspace folder. Only pass an absolute URI.',
      name: 'write_file',
      parameters: {
        additionalProperties: false,
        properties: {
          content: {
            description: 'New UTF-8 text content to write to the file.',
            type: 'string',
          },
          uri: {
            description: 'Absolute file URI within the workspace (for example: file:///workspace/src/index.ts).',
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

const getListFilesTool = (): ChatTool => {
  return {
    function: {
      description: 'List direct children (files and folders) for a folder URI inside the currently open workspace folder. Only pass an absolute URI.',
      name: 'list_files',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description: 'Absolute folder URI within the workspace (for example: file:///workspace/src).',
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

const getGetWorkspaceUriTool = (): ChatTool => {
  return {
    function: {
      description: 'Get the URI of the currently open workspace folder.',
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

const getRenderHtmlTool = (): ChatTool => {
  return {
    function: {
      description:
        'Render custom HTML and optional CSS directly in the chat tool call list using native chat UI rendering. Use this for structured cards, tables, and small dashboards. After calling this tool, do not repeat the same HTML, data table, or long content again as plain text unless the user explicitly asks for a text-only version.',
      name: 'render_html',
      parameters: {
        additionalProperties: false,
        properties: {
          css: {
            description: 'Optional CSS string applied inside the preview document.',
            type: 'string',
          },
          html: {
            description: 'HTML string to render in the preview document.',
            type: 'string',
          },
          title: {
            description: 'Optional short title for the preview.',
            type: 'string',
          },
        },
        required: ['html'],
        type: 'object',
      },
    },
    type: 'function',
  }
}

const getOpenPreviewTool = (): ChatTool => {
  return {
    function: {
      description: 'Open the right-side preview for an HTML file URI inside the currently open workspace folder.',
      name: 'open_preview',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description: 'Absolute HTML file URI within the workspace (for example: file:///workspace/index.html).',
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

const getClosePreviewTool = (): ChatTool => {
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

export const getBasicChatTools = (): readonly ChatTool[] => {
  return [
    getReadFileTool(),
    getWriteFileTool(),
    getListFilesTool(),
    getGetWorkspaceUriTool(),
    getRenderHtmlTool(),
    getOpenPreviewTool(),
    getClosePreviewTool(),
  ]
}
