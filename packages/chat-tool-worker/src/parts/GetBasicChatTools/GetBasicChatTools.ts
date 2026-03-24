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

const getRenameTool = (): ChatTool => {
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

const getEditFileTool = (): ChatTool => {
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
        'Get the URI of the currently open workspace folder. Call this first before using list_files, read_file, write_file, edit_file, open_preview, or openEditor when you do not already have a concrete workspace URI.',
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

const getRgTool = (): ChatTool => {
  return {
    function: {
      description: 'Search text or regex in workspace files using ripgrep-style arguments and return matching results.',
      name: 'rg',
      parameters: {
        additionalProperties: false,
        properties: {
          '-n': {
            description: 'When true, include line numbers in the output.',
            type: 'boolean',
          },
          output_mode: {
            description: 'Result format to return.',
            enum: ['content', 'files_with_matches', 'count'],
            type: 'string',
          },
          path: {
            description: 'Optional file or directory path inside the current workspace to scope the search.',
            type: 'string',
          },
          pattern: {
            description: 'Text or regular expression pattern to search for.',
            type: 'string',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
    },
    type: 'function',
  }
}

const getGrepSearchTool = (): ChatTool => {
  return {
    function: {
      description:
        "Do a fast text search in the workspace. Use this tool when you want to search with an exact string or regex. If you are not sure what words will appear in the workspace, prefer using regex patterns with alternation (|) or character classes to search for multiple potential words at once instead of making separate searches. For example, use 'function|method|procedure' to look for all of those words at once. Use includePattern to search within files matching a specific pattern, or in a specific file, using a relative path. Use 'includeIgnoredFiles' to include files normally ignored by .gitignore, other ignore files, and `files.exclude` and `search.exclude` settings. Warning: using this may cause the search to be slower, only set it when you want to search in ignored folders like node_modules or build outputs. Use this tool when you want to see an overview of a particular file, instead of using read_file many times to look for code within a file.\n\nIn a multi-root workspace, you can scope the search to a specific workspace folder by using the absolute path to the folder as the includePattern, e.g. /path/to/folder.",
      name: 'grep_search',
      parameters: {
        additionalProperties: false,
        properties: {
          includeIgnoredFiles: {
            description:
              'Whether to include files that would normally be ignored according to .gitignore, other ignore files and `files.exclude` and `search.exclude` settings. Warning: using this may cause the search to be slower. Only set it when you want to search in ignored folders like node_modules or build outputs.',
            type: 'boolean',
          },
          includePattern: {
            description:
              'Search files matching this glob pattern. Will be applied to the relative path of files within the workspace. To search recursively inside a folder, use a proper glob pattern like "src/folder/**". Do not use | in includePattern. Can also be an absolute path to a workspace folder to scope the search in a multi-root workspace.',
            type: 'string',
          },
          isRegexp: {
            description: 'Whether the pattern is a regex.',
            type: 'boolean',
          },
          maxResults: {
            description:
              "The maximum number of results to return. Do not use this unless necessary, it can slow things down. By default, only some matches are returned. If you use this and don't see what you're looking for, you can try again with a more specific query or a larger maxResults.",
            type: 'number',
          },
          query: {
            description:
              "The pattern to search for in files in the workspace. Use regex with alternation (e.g., 'word1|word2|word3') or character classes to find multiple potential words in a single search. Be sure to set the isRegexp property properly to declare whether it's a regex or plain text pattern. Is case-insensitive.",
            type: 'string',
          },
        },
        required: ['query', 'isRegexp'],
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

const getCreateDirectoryTool = (): ChatTool => {
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

const getGlobTool = (): ChatTool => {
  return {
    function: {
      description: 'Find files by glob pattern and return matching relative paths.',
      name: 'glob',
      parameters: {
        additionalProperties: false,
        properties: {
          pattern: {
            description: 'Glob pattern to match files, for example `packages/e2e/src/*.ts`.',
            type: 'string',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
    },
    type: 'function',
  }
}

const getUpdateTodoTool = (): ChatTool => {
  return {
    function: {
      description:
        'Update the active TODO checklist for the current chat session. Pass the full markdown checklist text with one item per line (for example "- [ ] Step one").',
      name: 'update_todo',
      parameters: {
        additionalProperties: false,
        properties: {
          todos: {
            description: 'Complete markdown checklist content to store as the current TODO list state.',
            type: 'string',
          },
        },
        required: ['todos'],
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
    getRenameTool(),
    getEditFileTool(),
    getListFilesTool(),
    getGetWorkspaceUriTool(),
    getRenderHtmlTool(),
    getOpenPreviewTool(),
    getOpenEditorTool(),
    getClosePreviewTool(),
    getSearchTextTool(),
    getRgTool(),
    getGrepSearchTool(),
    getRunInTerminalTool(),
    getCreateDirectoryTool(),
    getGlobTool(),
    getUpdateTodoTool(),
  ]
}
