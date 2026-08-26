const CHOSUNG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

const HANGUL_FIRST = 0xac00
const HANGUL_LAST = 0xd7a3
const CHO_STRIDE = 588

const isCompleteHangul = (code) => code >= HANGUL_FIRST && code <= HANGUL_LAST
const isJamo = (character) => /[ㄱ-ㅎ]/.test(character)

const chosungOf = (character) => {
  const code = character.charCodeAt(0)
  if (!isCompleteHangul(code)) return null
  return CHOSUNG[Math.floor((code - HANGUL_FIRST) / CHO_STRIDE)]
}

export const hangulMatch = (name, query) => {
  if (!query || name.includes(query)) return true

  for (let start = 0; start + query.length <= name.length; start++) {
    let matched = true
    for (let index = 0; index < query.length; index++) {
      const queryCharacter = query[index]
      const nameCharacter = name[start + index]
      if (queryCharacter === nameCharacter) continue
      if (isJamo(queryCharacter) && chosungOf(nameCharacter) === queryCharacter) continue
      matched = false
      break
    }
    if (matched) return true
  }
  return false
}

export const withParticle = (word, withBatchim, withoutBatchim) => {
  const code = word.at(-1)?.charCodeAt(0) ?? 0
  if (!isCompleteHangul(code)) return `${word}${withBatchim}`
  return `${word}${(code - HANGUL_FIRST) % 28 === 0 ? withoutBatchim : withBatchim}`
}
