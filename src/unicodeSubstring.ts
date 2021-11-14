/**
 * Credit: lautis/unicode-substring
 * Rewritten for Obsidian mobile functionality.
 */

const charAt = (string: string, index: number): string => {
  const first = string.charCodeAt(index)
  let second
  if (first >= 0xd800 && first <= 0xdbff && string.length > index + 1) {
    second = string.charCodeAt(index + 1)
    if (second >= 0xdc00 && second <= 0xdfff) {
      return string.substring(index, index + 2)
    }
  }
  return string[index]
}

const slice = (string: string, start: number, end: number): string => {
  let accumulator = ''
  let character
  let stringIndex = 0
  let unicodeIndex = 0
  const length = string.length

  while (stringIndex < length) {
    character = charAt(string, stringIndex)
    if (unicodeIndex >= start && unicodeIndex < end) {
      accumulator += character
    }
    stringIndex += character.length
    unicodeIndex += 1
  }
  return accumulator
}

const toNumber = (value: string | number, fallback: number): number => {
  if (value === undefined) {
    return fallback
  } else {
    return Number(value)
  }
}

export const unicodeSubstring = (
  string: string,
  start: number,
  end: number
): string => {
  const realStart = toNumber(start, 0)
  const realEnd = toNumber(end, string.length)
  if (realEnd === realStart) {
    return ''
  } else if (realEnd > realStart) {
    return slice(string, realStart, realEnd)
  } else {
    return slice(string, realEnd, realStart)
  }
}
