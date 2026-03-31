import type { ChatTool } from '../../Types/Types.ts'

export const getGrepSearchTool = (): ChatTool => {
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
          outputFormat: {
            description: 'Optional structured output format. Use "xml" for match tags or "json" for machine-readable JSON. When omitted, grep_search returns plain text lines.',
            enum: ['xml', 'json'],
            type: 'string',
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
