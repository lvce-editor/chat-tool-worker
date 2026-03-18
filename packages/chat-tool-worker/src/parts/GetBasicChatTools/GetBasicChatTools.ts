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
            description: 'Absolute file URI for a real path inside the currently open workspace folder. Do not use placeholder URIs.',
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

const getListFilesTool = (): ChatTool => {
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

const getGetWorkspaceUriTool = (): ChatTool => {
  return {
    function: {
      description:
        'Get the URI of the currently open workspace folder. Call this first before using list_files, read_file, write_file, open_preview, or openEditor when you do not already have a concrete workspace URI.',
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
            description: 'Absolute HTML file URI for a real path inside the currently open workspace folder. Do not use placeholder URIs.',
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

const getOpenEditorTool = (): ChatTool => {
  return {
    function: {
      description: 'Open a file URI in the editor.',
      name: 'openEditor',
      parameters: {
        additionalProperties: false,
        properties: {
          uri: {
            description: 'Absolute file URI for a real path inside the currently open workspace folder. Do not use placeholder URIs.',
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

const getSearchTextTool = (): ChatTool => {
  return {
    function: {
      description: 'Search text in workspace files using query options and return matching results.',
      name: 'search_text',
      parameters: {
        additionalProperties: false,
        properties: {
          options: {
            additionalProperties: false,
            properties: {
              exclude: {
                items: {
                  type: 'string',
                },
                type: 'array',
              },
              isRegex: {
                type: 'boolean',
              },
              machWholeWord: {
                type: 'boolean',
              },
              matchCase: {
                type: 'boolean',
              },
              value: {
                type: 'string',
              },
            },
            required: ['value', 'isRegex', 'matchCase', 'machWholeWord', 'exclude'],
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

const getRunInTerminalTool = (): ChatTool => {
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

export const getBasicChatTools = (): readonly ChatTool[] => {
  return [
    getReadFileTool(),
    getWriteFileTool(),
    getListFilesTool(),
    getGetWorkspaceUriTool(),
    getRenderHtmlTool(),
    getOpenPreviewTool(),
    getOpenEditorTool(),
    getClosePreviewTool(),
    getSearchTextTool(),
    getRunInTerminalTool(),
  ]
}
