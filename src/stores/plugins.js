/**
 * Pinia Plugin — 스토어 공통 부가 기능
 *
 * defineStore() 의 3번째 인자(옵션)로 켠다.
 *   persist:      { key, paths }  → localStorage 자동 저장/복원 ($subscribe · $patch)
 *   trackActions: { keys, limit } → 액션 호출 이력을 store.actionLog 에 기록 ($onAction)
 */

const snapshot = (source, keys) =>
  keys.reduce((result, key) => {
    result[key] = source[key]
    return result
  }, {})

const readStorage = (key) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 사생활 보호 모드 등 저장이 막힌 환경에서는 조용히 건너뛴다
  }
}

export function storeEnhancer({ store, options }) {
  const { persist, trackActions } = options

  if (persist) {
    const saved = readStorage(persist.key)
    // 복원: 여러 state 를 한 번의 변경으로 묶어 반영한다
    if (saved) store.$patch(snapshot(saved, persist.paths))

    // 저장: 액션이든 직접 수정이든 "상태가 바뀌는 모든 경로"를 한 번에 잡는다
    store.$subscribe((_mutation, state) => {
      writeStorage(persist.key, snapshot(state, persist.paths))
    })
  }

  if (trackActions) {
    const { keys, limit = 20 } = trackActions

    store.$onAction(({ name, after }) => {
      const before = snapshot(store, keys)

      after(() => {
        const current = snapshot(store, keys)
        const changed = keys.filter((key) => before[key] !== current[key])
        if (changed.length === 0) return

        store.actionLog.unshift({
          id: `${Date.now()}-${name}-${store.actionLog.length}`,
          name,
          changed,
          before,
          after: current,
          at: new Date().toTimeString().slice(0, 8),
        })
        store.actionLog.splice(limit)
      })
    })
  }
}
