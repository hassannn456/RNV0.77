export type ParseFragment =
  | { tag: 'a'; href: string; content: ParseTree }
  | { tag: 'b'; content: ParseTree }
  | { tag: 'span'; class: string; content: ParseTree }
  | { tag: 'div'; class: string; content: ParseTree }
  | { tag: null; content: string }
export type ParseTree = ParseFragment[]

/** Match anchor tags */
const regexAnchorTag = /(.*)<a (.*?)>(.*)<\/a>(.*)/s
/** Match bold tags */
const regexBoldTag = /(.*)<(?:b|strong)>(.*)<\/(?:b|strong)>(.*)/s
/** Match span tags */
const regexSpanTag = /(.*)<span (.*?)>(.*)<\/.*>(.*)/s
/** Match other open/close tags */
const regexOpenCloseTag = /(.*)<.*>(.*)<\/.*>(.*)/s
/** Match other simple tags */
const regexSimpleTag = /(.*)<.*>(.*)/s
/** Match key value pairs */
const regexKeyValuePairs = /([A-Za-z0-9-]+)=['"](.*?)['"]/gs

/** See parse.test.js for documentation. */
export const parseKeyValueString = (text: string): Record<string, string> => {
  const matchTagValueArray = [...text.matchAll(regexKeyValuePairs)]
  const result: Record<string, string> = {}
  for (let i = 0; i < matchTagValueArray.length; i++) {
    const [_, tag, value] = matchTagValueArray[i]
    result[tag] = value
  }
  return result
}

export const parseText = (text: string): ParseTree => {
  if (!text) return []
  {
    const matches = regexAnchorTag.exec(text)
    if (matches) {
      const [_, before, kvString, content, after] = matches
      const kvObject = parseKeyValueString(kvString)
      return parseText(before)
        .concat([
          { tag: 'a', href: kvObject.href, content: parseText(content) },
        ])
        .concat(parseText(after))
    }
  }
  {
    const matches = regexBoldTag.exec(text)
    if (matches) {
      const [_, before, content, after] = matches
      return parseText(before)
        .concat([{ tag: 'b', content: parseText(content) }])
        .concat(parseText(after))
    }
  }
  {
    const matches = regexSpanTag.exec(text)
    if (matches) {
      const [_, before, kvString, content, after] = matches
      const kvObject = parseKeyValueString(kvString)
      return parseText(before)
        .concat([
          { tag: 'span', class: kvObject.class, content: parseText(content) },
        ])
        .concat(parseText(after))
    }
  }
  {
    const matches = regexOpenCloseTag.exec(text)
    if (matches) {
      const [_, before, content, after] = matches
      return parseText(before)
        .concat(parseText(content))
        .concat(parseText(after))
    }
  }
  {
    const matches = regexSimpleTag.exec(text)
    if (matches) {
      const [_, before, after] = matches
      return parseText(before).concat(parseText(after))
    }
  }
  return [{ tag: null, content: text }]
}
