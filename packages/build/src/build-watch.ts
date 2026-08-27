import { execa } from 'execa'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const commonArgs = ['--format=esm', '--bundle', '--platform=node', '--watch']

const tasks = [
  {
    input: 'packages/chat-tool-worker/src/chatToolWorkerMain.ts',
    outputDir: '.tmp/dist-chat-tool-worker/dist',
    outputFile: '.tmp/dist-chat-tool-worker/dist/chatToolWorkerMain.js',
    external: ['electron', 'ws'],
  },
]

const main = async () => {
  for (const task of tasks) {
    await mkdir(join(root, task.outputDir), { recursive: true })
    const args = [
      ...commonArgs,
      ...task.external.map((item) => `--external:${item}`),
      join(root, task.input),
      `--outfile=${join(root, task.outputFile)}`,
    ]
    execa('npm', ['exec', '--workspace', 'build', '--', 'esbuild', ...args], {
      cwd: root,
      stdio: 'inherit',
    })
  }
}

main()
