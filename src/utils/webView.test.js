import { formatHTML } from './webView'

it('Renders every HTML section in the same sequence as passed in', () => {
  const output = formatHTML([
    '<div class="one">Section One</div>',
    '<div class="two">Section Two</div>',
    '<div class="three">Section Three</div>',
  ])
  const regex = /<section class="content-section">(.*?)<\/section>/gs
  let match
  const sections = []
  while ((match = regex.exec(output)) !== null) {
    sections.push(match[1]) // Group 1 contains the inner HTML
  }
  expect(sections.length).toEqual(3)
  expect(sections[0].trim()).toBe('<div class="one">Section One</div>')
  expect(sections[1].trim()).toBe('<div class="two">Section Two</div>')
  expect(sections[2].trim()).toBe('<div class="three">Section Three</div>')
})

it('Renders arbitrary JavaScript as passed in', () => {
  const output = formatHTML(
    ['<div class="one">One</div>'],
    `console.log('Hi!')`,
  )
  const regex = /<script>(.*?)<\/script>/gs
  const match = regex.exec(output)
  const scriptTagContents = match[1].trim() // Group 1 contains the inner HTML
  expect(scriptTagContents).toBe(`console.log('Hi!')`)
})
