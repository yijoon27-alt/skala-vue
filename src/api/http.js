import axios from 'axios'
import { reactive } from 'vue'

/**
 * 통신 공통 계층 — axios.create + 인터셉터
 *
 * 화면 컴포넌트가 URL·키·에러 문구를 직접 다루지 않도록 여기서 한 번에 처리한다.
 *   요청 인터셉터: 공통 파라미터(키·단위·언어) 주입 + 소요 시간 측정 시작
 *   응답 인터셉터: 통신 기록 적재 + 에러를 화면에 그대로 쓸 수 있는 형태로 표준화
 */

/** 인터셉터가 쌓는 통신 기록 — 화면의 "통신 계기판"이 그대로 읽는다 */
export const requestLog = reactive([])
const LOG_LIMIT = 12

export const clearRequestLog = () => requestLog.splice(0)

const pushLog = (entry) => {
  requestLog.unshift({ id: `${Date.now()}-${requestLog.length}-${entry.url}`, ...entry })
  requestLog.splice(LOG_LIMIT)
}

const elapsedOf = (config) =>
  config?.metadata ? Math.round(performance.now() - config.metadata.startedAt) : 0

/** 상태 코드별 안내 문구 — 교재 예제의 alert 한 줄이 담지 못하는 원인 구분 */
const STATUS_MESSAGE = {
  400: '요청 파라미터가 잘못되었습니다. 좌표 값을 확인하세요.',
  401: 'API 키가 잘못되었거나 아직 활성화되지 않았습니다. 발급 후 최대 2시간이 걸립니다.',
  404: '요청한 엔드포인트를 찾을 수 없습니다. 주소를 확인하세요.',
  429: '무료 요금제 호출 한도(분당 60회)를 넘었습니다. 잠시 후 다시 시도하세요.',
}

export class ApiFailure extends Error {
  constructor(kind, message, { status = 0, provider = '', url = '' } = {}) {
    super(message)
    this.name = 'ApiFailure'
    this.kind = kind // canceled | timeout | network | client | server
    this.status = status
    this.provider = provider
    this.url = url
  }
}

const toFailure = (error, provider) => {
  const url = error.config?.url ?? ''
  const meta = { provider, url }

  if (axios.isCancel(error)) {
    return new ApiFailure('canceled', '새 요청이 들어와 이전 요청을 취소했습니다.', meta)
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiFailure('timeout', '응답이 제한 시간을 넘겨 중단했습니다.', meta)
  }
  if (!error.response) {
    return new ApiFailure('network', '네트워크에 연결할 수 없습니다.', meta)
  }

  const { status } = error.response
  const message =
    STATUS_MESSAGE[status] ??
    (status >= 500 ? '기상 서버에 문제가 있습니다.' : '요청을 처리하지 못했습니다.')
  return new ApiFailure(status >= 500 ? 'server' : 'client', message, { ...meta, status })
}

/**
 * 인터셉터가 붙은 Axios 인스턴스를 만든다.
 * @param provider 화면 기록에 남길 제공자 이름
 * @param config   axios.create 설정 (baseURL 등)
 * @param decorate 요청 직전 공통 파라미터를 채우는 함수
 */
export const createLoggedClient = (provider, config, decorate) => {
  const client = axios.create({ timeout: 8000, ...config })

  client.interceptors.request.use((requestConfig) => {
    requestConfig.metadata = { startedAt: performance.now() }
    return decorate ? decorate(requestConfig) : requestConfig
  })

  client.interceptors.response.use(
    (response) => {
      pushLog({
        provider,
        url: response.config.url,
        status: response.status,
        elapsed: elapsedOf(response.config),
        ok: true,
        message: '성공',
      })
      return response
    },
    (error) => {
      const failure = toFailure(error, provider)
      pushLog({
        provider,
        url: failure.url,
        status: failure.status,
        elapsed: elapsedOf(error.config),
        ok: false,
        message: failure.message,
      })
      // 화면은 error.response.status 를 뒤질 필요 없이 failure.message 만 쓰면 된다
      return Promise.reject(failure)
    },
  )

  return client
}
