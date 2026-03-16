import { expect, test } from '@jest/globals'
import * as ExecuteRenderHtmlTool from '../src/parts/ExecuteRenderHtmlTool/ExecuteRenderHtmlTool.ts'

const options = {
  assetDir: '',
  platform: 0,
}

test('executeRenderHtmlTool returns error when html is missing', async () => {
  const result = await ExecuteRenderHtmlTool.executeRenderHtmlTool({}, options)
  expect(result).toEqual({ error: 'Missing required argument: html' })
})

test('executeRenderHtmlTool returns ok payload for valid input', async () => {
  const result = await ExecuteRenderHtmlTool.executeRenderHtmlTool({ css: 'h1{color:red}', html: '<h1>Hi</h1>', title: 'Preview' }, options)
  expect(result).toEqual({ css: 'h1{color:red}', html: '<h1>Hi</h1>', ok: true, title: 'Preview' })
})

test('executeRenderHtmlTool rejects oversized html', async () => {
  const html = 'a'.repeat(40_001)
  const result = await ExecuteRenderHtmlTool.executeRenderHtmlTool({ html }, options)
  expect(result).toEqual({ error: 'Payload too large: keep html/css under 40,000 characters each.' })
})

test('executeRenderHtmlTool rejects oversized css', async () => {
  const css = 'a'.repeat(40_001)
  const result = await ExecuteRenderHtmlTool.executeRenderHtmlTool({ css, html: '<div></div>' }, options)
  expect(result).toEqual({ error: 'Payload too large: keep html/css under 40,000 characters each.' })
})

