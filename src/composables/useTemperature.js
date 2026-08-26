import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

/**
 * 온도 단위 변환 Composable
 *
 * 교재 p.212 는 이 변환 코드가 메인/상세에서 중복된다는 점을 지적하고
 * "Composable 로 해결 가능함 (범위 제외)" 로 남겨 두었다.
 *
 * 주의 1: 절대 온도와 온도 "차이" 의 변환식이 다르다.
 *         5℃ 차이는 41℉ 가 아니라 9℉ 다 (+32 오프셋은 차이값에 붙지 않는다).
 * 주의 2: 판단 임계값(더움/폭염 등)은 변환하지 않는다. 원본 섭씨로 비교하고
 *         화면에 찍는 숫자만 변환해야 단위를 바꿔도 판정이 뒤집히지 않는다.
 */
export function useTemperature() {
  const configStore = useConfigStore()

  const unit = computed(() => configStore.unit)
  const symbol = computed(() => configStore.unitSymbol)
  const isFahrenheit = computed(() => configStore.isFahrenheit)

  // 절대 온도 — 교재 p.212 샘플과 동일
  const convert = (celsius) => (isFahrenheit.value ? Math.round((celsius * 9) / 5 + 32) : celsius)

  // 온도 차이 — 배율만 적용하고 +32 는 붙이지 않는다
  const convertDelta = (celsius) =>
    isFahrenheit.value ? Math.round((celsius * 9 * 10) / 5) / 10 : celsius

  const format = (celsius) => `${convert(celsius)}${symbol.value}`
  const formatDelta = (celsius) => `${convertDelta(celsius)}${symbol.value}`

  return { unit, symbol, isFahrenheit, convert, convertDelta, format, formatDelta }
}
