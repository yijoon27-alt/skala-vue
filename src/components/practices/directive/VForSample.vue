<script setup>
import { ref, computed } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.88) — 배열 / 객체 / 배열 내 객체 렌더링
 * ───────────────────────────────────────────── */
const fruits = ref(['사과', '바나나', '딸기'])
const user = ref({
  name: '홍길동',
  age: 25,
  role: '개발자',
})
const items = ref([
  { id: 'prod_101', name: '아이폰' },
  { id: 'prod_102', name: '갤럭시' },
])

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 1 — 검색 / 정렬 / 합계
 * 교재는 배열을 그대로 뿌리기만 한다. 실무에서 v-for는 거의 항상
 * "가공된 배열"을 그린다. 원본은 두고 가공 결과만 computed로 만든다.
 * ───────────────────────────────────────────── */
const products = ref([
  { id: 'prod_101', name: '아이폰 17', price: 1350000, stock: 4 },
  { id: 'prod_102', name: '갤럭시 S26', price: 1180000, stock: 0 },
  { id: 'prod_103', name: '아이패드 프로', price: 1590000, stock: 12 },
  { id: 'prod_104', name: '갤럭시 탭', price: 890000, stock: 7 },
  { id: 'prod_105', name: '애플워치', price: 590000, stock: 0 },
])

const keyword = ref('')
const sortBy = ref('name')
const hideSoldOut = ref(false)

// 원본 products는 건드리지 않고, 화면에 그릴 배열만 새로 만든다.
const visibleProducts = computed(() => {
  const word = keyword.value.trim().toLowerCase()

  const filtered = products.value.filter((p) => {
    const matched = p.name.toLowerCase().includes(word)
    return hideSoldOut.value ? matched && p.stock > 0 : matched
  })

  // toSorted()는 원본을 변형하지 않고 정렬된 새 배열을 돌려준다 (ES14)
  return filtered.toSorted((a, b) => {
    if (sortBy.value === 'priceAsc') return a.price - b.price
    if (sortBy.value === 'priceDesc') return b.price - a.price
    return a.name.localeCompare(b.name)
  })
})

const totalPrice = computed(() => visibleProducts.value.reduce((sum, p) => sum + p.price, 0))

const formatWon = (n) => n.toLocaleString('ko-KR') + '원'

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 2 — :key를 index로 주면 왜 안 되는가
 * 교재는 "고유한 :key를 안 주면 에러 또는 성능 저하"라고 경고만 한다.
 * 실제로 데이터가 깨지는 장면을 눈으로 확인한다.
 * ───────────────────────────────────────────── */
const members = ref([
  { id: 1, name: '김철수' },
  { id: 2, name: '이영희' },
  { id: 3, name: '박민수' },
])

// 맨 앞에 새 항목을 끼워 넣어 기존 요소들의 index를 한 칸씩 밀어버린다
let nextId = 4
function prependMember() {
  members.value.unshift({ id: nextId, name: `신입${nextId}` })
  nextId++
}

function resetMembers() {
  members.value = [
    { id: 1, name: '김철수' },
    { id: 2, name: '이영희' },
    { id: 3, name: '박민수' },
  ]
  nextId = 4
}
</script>

<template>
  <div class="practice-section">
    <h2>v-for 디렉티브 학습</h2>

    <!-- 교재 원본 (p.88) -->
    <h3>1) 배열 렌더링</h3>
    <ul>
      <li v-for="(fruit, index) in fruits" :key="index">{{ index + 1 }}번 과일: {{ fruit }}</li>
    </ul>
    <h3>2) 객체 렌더링</h3>
    <ul>
      <li v-for="(value, key, index) in user" :key="key">[{{ index }}] {{ key }} : {{ value }}</li>
    </ul>
    <h3>3) 배열 내 객체 렌더링</h3>
    <ul>
      <li v-for="(item, index) in items" :key="item.id">[{{ index }}] {{ item.name }}</li>
    </ul>

    <hr class="divider" />

    <!-- 🔧 개인 응용 1 -->
    <section class="custom">
      <h3>🔧 개인 응용 1 : 검색 · 정렬 · 합계</h3>
      <p class="desc">
        원본 <code>products</code> 배열은 그대로 두고, 화면에 그릴 배열만 <code>computed</code>로
        새로 만든다. v-for는 이 가공된 결과를 렌더링한다.
      </p>

      <div class="controls">
        <input v-model="keyword" placeholder="상품명 검색" />
        <select v-model="sortBy">
          <option value="name">이름순</option>
          <option value="priceAsc">가격 낮은순</option>
          <option value="priceDesc">가격 높은순</option>
        </select>
        <label> <input type="checkbox" v-model="hideSoldOut" /> 품절 상품 숨기기 </label>
      </div>

      <table class="product-table">
        <thead>
          <tr>
            <th>상품명</th>
            <th>가격</th>
            <th>재고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in visibleProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ formatWon(product.price) }}</td>
            <td>
              <span v-if="product.stock > 0">{{ product.stock }}개</span>
              <span v-else class="sold-out">품절</span>
            </td>
          </tr>
          <tr v-if="visibleProducts.length === 0">
            <td colspan="3" class="empty">검색 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <p class="summary">
        표시된 상품 <strong>{{ visibleProducts.length }}</strong
        >개 / 합계 <strong>{{ formatWon(totalPrice) }}</strong>
      </p>
    </section>

    <hr class="divider" />

    <!-- 🔧 개인 응용 2 -->
    <section class="custom">
      <h3>🔧 개인 응용 2 : :key를 index로 주면 생기는 버그</h3>
      <p class="desc">
        아래 두 목록은 <strong>:key만 다르고</strong> 내용은 완전히 같다.
        <strong>양쪽 입력창에 아무 글자나 적은 뒤</strong> "맨 앞에 추가" 버튼을 눌러보자.
      </p>

      <div class="controls">
        <button @click="prependMember">맨 앞에 추가</button>
        <button @click="resetMembers">초기화</button>
      </div>

      <div class="compare">
        <div class="panel danger">
          <h4>❌ :key="index"</h4>
          <ul>
            <li v-for="(member, index) in members" :key="index">
              {{ member.name }}
              <input placeholder="메모를 적어보세요" />
            </li>
          </ul>
        </div>
        <div class="panel safe">
          <h4>✅ :key="member.id"</h4>
          <ul>
            <li v-for="member in members" :key="member.id">
              {{ member.name }}
              <input placeholder="메모를 적어보세요" />
            </li>
          </ul>
        </div>
      </div>

      <p class="note">
        💡 왼쪽은 입력한 메모가 <strong>엉뚱한 사람에게 달라붙는다.</strong> 맨 앞에 항목이 끼어들면
        기존 요소들의 index가 한 칸씩 밀리는데, Vue는 key를 기준으로 요소를 재사용하므로 "0번
        자리"에 있던 DOM(입력값 포함)을 새로 들어온 항목이 그대로 물려받기 때문이다.
        <br />
        💡 오른쪽은 key가 id라서 각 항목이 자기 DOM을 그대로 유지한다. 배열의
        <strong>순서가 바뀔 수 있다면 index를 key로 쓰면 안 된다.</strong>
      </p>
    </section>
  </div>
</template>

<style scoped>
.divider {
  margin: 25px 0;
  border: none;
  border-top: 2px dashed #ccc;
}
.custom h3 {
  color: #42b883;
}
.desc {
  color: #555;
  font-size: 14px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.product-table {
  border-collapse: collapse;
  width: 100%;
  max-width: 480px;
}
.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 8px 10px;
  text-align: left;
}
.product-table th {
  background-color: #42b883;
  color: white;
}
.sold-out {
  color: #e74c3c;
  font-weight: bold;
}
.empty {
  text-align: center;
  color: #777;
}
.summary {
  font-size: 15px;
}
.compare {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 15px 0;
}
.panel {
  flex: 1 1 260px;
  border-radius: 6px;
  padding: 12px;
}
.panel h4 {
  margin: 0 0 8px;
}
.panel.danger {
  border: 2px solid #e74c3c;
  background-color: #fdedec;
}
.panel.safe {
  border: 2px solid #42b883;
  background-color: #eafaf3;
}
.panel ul {
  padding-left: 18px;
  margin: 0;
}
.panel li {
  margin-bottom: 6px;
}
.note {
  margin-top: 15px;
  padding: 12px;
  background-color: #fff8e1;
  border-left: 4px solid #f1c40f;
  font-size: 13px;
  line-height: 1.7;
}
</style>
