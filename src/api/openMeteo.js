import { createLoggedClient } from './http'

/**
 * Open-Meteo — 키가 필요 없는 무료 기상 API
 *
 * OpenWeather 와 같은 좌표를 다른 기관 데이터로 교차 검증하는 데 쓴다.
 * 주의: 풍속 기본 단위가 km/h 라서 그대로 비교하면 OpenWeather(m/s)와 3.6배 어긋난다.
 *       요청 파라미터로 단위를 맞춰서 받아온다.
 */
const client = createLoggedClient('Open-Meteo', { baseURL: 'https://api.open-meteo.com/v1' })

// WMO Weather interpretation code → 표시 문구
const WMO_TEXT = [
  { max: 0, text: '맑음' },
  { max: 3, text: '구름' },
  { max: 48, text: '안개' },
  { max: 57, text: '이슬비' },
  { max: 67, text: '비' },
  { max: 77, text: '눈' },
  { max: 82, text: '소나기' },
  { max: 99, text: '뇌우' },
]

const toText = (code) => WMO_TEXT.find((item) => code <= item.max)?.text ?? '알 수 없음'

export const fetchCrossCheck = (city, config = {}) =>
  client
    .get('/forecast', {
      params: {
        latitude: city.lat,
        longitude: city.lon,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        wind_speed_unit: 'ms', // OpenWeather 와 단위를 맞춘다
        timezone: 'Asia/Seoul',
      },
      ...config,
    })
    .then(({ data }) => ({
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      wind: Number(data.current.wind_speed_10m.toFixed(1)),
      status: toText(data.current.weather_code),
      observedAt: data.current.time.slice(11, 16),
    }))
