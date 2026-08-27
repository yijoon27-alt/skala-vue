/**
 * 도시 기준 정보 + Mock 관측값
 *
 * lat / lon / english 는 OpenWeatherMap 호출에 쓰이는 좌표이고,
 * temp 이하의 관측값은 실시간 통신이 막혔을 때(키 없음·오프라인·호출 실패)
 * 화면이 비지 않도록 남겨 둔 Fallback 값이다. weatherStore 가 실시간 값으로 덮어쓴다.
 *
 * condition 은 '비'·'맑음' 같은 표시 문자열과 별개인 분류 코드다.
 * OpenWeather 의 한국어 설명은 '온흐림'·'실비'처럼 수십 종이라
 * 문자열을 그대로 비교하면 판정 규칙이 깨진다. 규칙은 항상 condition 으로 비교한다.
 */
export const weatherCities = [
  {
    id: 'city_01',
    name: '서울',
    english: 'Seoul',
    fullName: '대한민국 서울특별시',
    lat: 37.5665,
    lon: 126.978,
    temp: 28,
    feelsLike: 29,
    status: '맑음',
    condition: 'clear',
    humidity: 55,
    wind: 2.5,
    precipitation: 10,
    observedAt: '14:00',
  },
  {
    id: 'city_02',
    name: '수원',
    english: 'Suwon',
    fullName: '경기도 수원시 영통구',
    lat: 37.2636,
    lon: 127.0286,
    temp: 24,
    feelsLike: 25,
    status: '비',
    condition: 'rain',
    humidity: 88,
    wind: 4.1,
    precipitation: 80,
    observedAt: '14:00',
  },
  {
    id: 'city_03',
    name: '부산',
    english: 'Busan',
    fullName: '부산광역시 해운대구',
    lat: 35.1796,
    lon: 129.0756,
    temp: 26,
    feelsLike: 27,
    status: '구름',
    condition: 'clouds',
    humidity: 72,
    wind: 5,
    precipitation: 30,
    observedAt: '14:00',
  },
  {
    id: 'city_04',
    name: '제주',
    english: 'Jeju',
    fullName: '제주특별자치도 제주시',
    lat: 33.4996,
    lon: 126.5312,
    temp: 30,
    feelsLike: 32,
    status: '흐림',
    condition: 'clouds',
    humidity: 79,
    wind: 6.2,
    precipitation: 40,
    observedAt: '14:00',
  },
  {
    id: 'city_05',
    name: '강릉',
    english: 'Gangneung',
    fullName: '강원특별자치도 강릉시',
    lat: 37.7519,
    lon: 128.8761,
    temp: 22,
    feelsLike: 21,
    status: '소나기',
    condition: 'rain',
    humidity: 91,
    wind: 3.7,
    precipitation: 70,
    observedAt: '14:00',
  },
  {
    id: 'city_06',
    name: '판교',
    english: 'Pangyo',
    fullName: '경기도 성남시 분당구 판교',
    lat: 37.4058316,
    lon: 127.0981535,
    temp: 27,
    feelsLike: 28,
    status: '구름',
    condition: 'clouds',
    humidity: 64,
    wind: 3.2,
    precipitation: 20,
    observedAt: '14:00',
  },
]

export const findWeatherCity = (cityId) => weatherCities.find((city) => city.id === cityId) ?? null

/** 비가 오는 상태인지 — 표시 문자열이 아니라 분류 코드로 판단한다 */
export const isRainy = (city) => ['rain', 'drizzle', 'thunderstorm'].includes(city?.condition ?? '')
