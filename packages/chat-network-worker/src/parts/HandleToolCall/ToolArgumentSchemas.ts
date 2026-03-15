import type { ToolArgumentSchema } from './types.ts'

export const toolArgumentSchemas: Readonly<Record<string, ToolArgumentSchema>> = {
  getWorkspaceUri: {
    additionalProperties: false,
    properties: {},
    required: [],
  },
  list_files: {
    additionalProperties: false,
    properties: {
      path: 'string',
    },
    required: [],
  },
  read_file: {
    additionalProperties: false,
    properties: {
      uri: 'string',
    },
    required: ['uri'],
  },
  render_html: {
    additionalProperties: false,
    properties: {
      css: 'string',
      html: 'string',
      title: 'string',
    },
    required: ['html'],
  },
  write_file: {
    additionalProperties: false,
    properties: {
      content: 'string',
      path: 'string',
    },
    required: ['path', 'content'],
  },
}
