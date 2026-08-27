import axios from 'axios'
import { createLoggedClient } from './http'

const API_KEY = (import.meta.env.VITE_OPENWEATHER_API_KEY ?? '').trim()

/** 키가 없으면 통신을 시도하지 않고 Mock 으로 내려간다 */
export const hasApiKey = API_KEY.length > 0

// 요청 인터셉터가 키·단위·언어를 자동으로 채우므로 호출부는 좌표만 넘긴다
const client = createLoggedClient(
  'OpenWeather',
  { baseURL: 'https://api.openweathermap.org/data/2.5' },
  (config) => {
    config.params = { appid: API_KEY, units: 'metric', lang: 'kr', ...config.params }
    return config
  },
)

/** 한국어 설명('온흐림'·'실비'…) 대신 weather[0].id 대역으로 상태를 분류한다 */
const toCondition = (weatherId) => {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm'
  if (weatherId >= 300 && weatherId < 400) return 'drizzle'
  if (weatherId >= 500 && weatherId < 600) return 'rain'
  if (weatherId >= 600 && weatherId < 700) return 'snow'
  if (weatherId >= 700 && weatherId < 800) return 'atmosphere'
  return weatherId === 800 ? 'clear' : 'clouds'
}

/** 관측 시각을 도시의 현지 시각으로 표기한다 (응답의 timezone 오프셋 사용) */
const toLocalTime = (unixSeconds, timezoneOffset = 0) =>
  new Date((unixSeconds + timezoneOffset) * 1000).toISOString().slice(11, 16)

const AQI_LABELS = ['좋음', '양호', '보통', '나쁨', '매우 나쁨']

const coordsOf = (city) => ({ lat: city.lat, lon: city.lon })

export const fetchCurrent = (city, config = {}) =>
  client.get('/weather', { params: coordsOf(city), ...config }).then(({ data }) => ({
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    status: data.weather[0].description,
    condition: toCondition(data.weather[0].id),
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    wind: Number(data.wind.speed.toFixed(1)),
    observedAt: toLocalTime(data.dt, data.timezone),
  }))

/** 3시간 간격 예보 — 현재 날씨 API 에 없는 강수확률(pop)이 여기에 들어 있다 */
export const fetchForecast = (city, config = {}) =>
  client.get('/forecast', { params: { ...coordsOf(city), cnt: 8 }, ...config }).then(({ data }) => {
    const slots = data.list.map((slot) => ({
      time: toLocalTime(slot.dt, data.city.timezone),
      temp: Math.round(slot.main.temp),
      pop: Math.round(slot.pop * 100),
      status: slot.weather[0].description,
      condition: toCondition(slot.weather[0].id),
    }))

    return {
      slots,
      // 앞으로 24시간 중 가장 높은 강수확률을 대표값으로 쓴다
      precipitation: slots.reduce((max, slot) => Math.max(max, slot.pop), 0),
    }
  })

/** 대기질 — 좌표는 같지만 응답 규격이 완전히 다른 별도 엔드포인트 */
export const fetchAirPollution = (city, config = {}) =>
  client.get('/air_pollution', { params: coordsOf(city), ...config }).then(({ data }) => {
    const [record] = data.list
    return {
      aqi: record.main.aqi,
      aqiLabel: AQI_LABELS[record.main.aqi - 1] ?? '알 수 없음',
      pm10: Math.round(record.components.pm10),
      pm25: Math.round(record.components.pm2_5),
      measuredAt: toLocalTime(record.dt, 32400),
    }
  })

/** 도시 1곳의 현재+예보를 동시에 받아 Mock 과 같은 형태로 합친다 */
export const fetchCityWeather = (city, config = {}) =>
  axios.all([fetchCurrent(city, config), fetchForecast(city, config)]).then(
    axios.spread((current, forecast) => ({
      ...current,
      precipitation: forecast.precipitation,
      slots: forecast.slots,
    })),
  )

/** 도시 여러 곳을 병렬로 조회한다 (교재 p.226 axios.all) */
export const fetchAllCities = (cities, config = {}) =>
  axios.all(cities.map((city) => fetchCityWeather(city, config)))

/** 순차 조회 — 병렬과의 소요 시간 차이를 화면에서 비교하기 위한 대조군 */
export const fetchAllCitiesInSequence = async (cities, config = {}) => {
  const results = []
  for (const city of cities) {
    results.push(await fetchCityWeather(city, config))
  }
  return results
}

/** 인터셉터의 에러 표준화를 확인하기 위한 의도적 실패 호출 */
export const fetchWithBrokenKey = (city) =>
  client.get('/weather', { params: { ...coordsOf(city), appid: 'invalid-key-for-demo' } })

export const fetchUnknownEndpoint = () => client.get('/no-such-endpoint')
