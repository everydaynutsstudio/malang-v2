# Project: Malang (말랑) — Design Spec v2.2

> **Version:** 2.2 (MVP / 1-month scope)
> **Last Updated:** 2026-04-19
> **Studio:** Everyday Nuts
> **Platform:** Mobile (Portrait, 9:16)
> **Tech Stack:** React + Vite / Framer Motion / Howler.js / Zustand / Capacitor (APK)
> **Core Fantasy:** 아이소메트릭 카페에서 말랑한 버블티를 만드는 ASMR 힐링 시뮬레이션

---

## 1. Design Pillars

1. **Sensory First** — 게임의 재미는 숙련이 아니라 감각(촉감, 소리, 색감). 실패 없음, 보상만 있음.
2. **One Scene, One Loop** — 씬 전환 없음. 아이소메트릭 카페 한 화면 안에서 모든 플레이가 이루어짐.
3. **Ship Over Perfect** — v1은 코어 루프만. 확장은 업데이트로.

---

## 2. Game Flow — Single Scene Architecture

게임은 **단일 씬(Single Scene)** 내에서 `cupState` 상태 머신 하나로 동작한다.
씬 전환, 라우팅 없음. UI 패널 교체 없음. 카메라 이동 없음.

### 2.1 State Machine: `cupState`

```
IDLE → FILLING → READY_TO_SHAKE → SHAKING → READY_TO_SERVE → SERVING → IDLE (loop)
```

| State | 진입 조건 | 플레이어 액션 | 종료 조건 |
|-------|----------|-------------|----------|
| `IDLE` | 앱 시작 / 서빙 완료 후 | 없음 (빈 컵 자동 배치) | 첫 재료 탭 |
| `FILLING` | 재료 첫 탭 | 재료 `TAP` 버블 탭하여 컵에 재료 추가 | 최소 조건 충족 후 `DONE ✓` 버튼 탭 |
| `READY_TO_SHAKE` | DONE 탭 | 없음 (뚜껑 애니메이션 자동 재생, 이후 SHAKE 버튼 표시) | `SHAKE` 버튼 탭 |
| `SHAKING` | SHAKE 버튼 탭 | 좌우 swipe로 게이지 채우기 | 게이지 100% |
| `READY_TO_SERVE` | 게이지 완료 | 없음 (뚜껑 열림/빨대 연출) | 자동 전환 |
| `SERVING` | 서빙 준비 완료 | 컵을 픽업대(Takeout Window)로 드래그 | 컵이 픽업대 영역 도달 |
| → `IDLE` | 서빙 완료 | 코인 보상 이펙트 재생 → 새 빈 컵 등장 | — |

### 2.2 Phase 상세

#### IDLE
- 작업대 중앙에 빈 투명 컵이 놓여 있음.
- 모든 재료 디스펜서에 `TAP` 인디케이터가 표시됨.
- 상단 HUD(코인)는 항상 표시.
- 캐릭터: 대기 포즈.
- **Soft Order 롤:** 50% 확률로 픽업대 위에 Soft Order 말풍선 팝업 (§6 참고).

#### FILLING
- **인터랙션: 1-step TAP.** 재료의 `TAP` 버블을 탭하면 즉시 해당 재료가 컵에 추가됨.
  - "재료 선택 → 컵 터치" 2-step 아님. 탭 한 번 = 1 unit 추가. 여러 번 탭 = 더 많이.
- 탭 시 동시 반응:
  1. 재료통 리액션 (하이라이트 + bounce).
  2. 캐릭터 도구 포즈 전환.
  3. 재료가 컵에 추가 (layer별 연출, §3 참고).
  4. ASMR 효과음 재생.
  5. Soft Order 조건 체크 → 충족 시 말풍선 ✓ 표시 (§6 참고).
- 재료는 자유롭게 조합 가능. 순서 무관. 정답/오답 없음.
- 컵 내부는 **자동 레이어 정렬** (§3.2 참고) — 어떤 순서로 넣든 물리적으로 자연스러운 위치에 배치.
- **최소 조건:** Base(액체) 1종 이상 포함 시 `DONE ✓` 버튼 표시 (컵 위).
- `DONE ✓` 탭 → READY_TO_SHAKE 전환.

#### READY_TO_SHAKE
- `DONE ✓` 버튼 사라짐.
- 컵에 뚜껑이 씌워지는 애니메이션 (0.5초).
- 뚜껑 장착 완료 후, **같은 위치(컵 위)에 `SHAKE` 버튼 등장.**
- `SHAKE` 버튼 탭 → SHAKING 전환.
  - 플레이어에게 "준비됐을 때 시작" 통제감 부여.

#### SHAKING
- `SHAKE` 버튼 사라짐.
- 캐릭터: 컵 잡기 포즈로 전환.
- `SWIPE ←→` 인디케이터 등장 (컵 위, 버튼들과 동일 위치).
- 게이지 UI 표시 (위치: 별도 결정).
- 플레이어가 좌우 swipe (또는 좌우 드래그).
- swipe에 반응하여:
  - 컵이 좌우로 기울어지는 애니메이션.
  - **얼음 부딪히는 ASMR 사운드** 루프 재생.
  - 게이지가 채워짐.
- 게이지 100% 도달 시 → READY_TO_SERVE.

#### READY_TO_SERVE
- 뚜껑이 열리고, 빨대가 꽂히는 연출 (선택적, 공수에 따라 생략 가능).
- 컵 위에 `DRAG →` 인디케이터. 픽업대 방향 화살표.
- 캐릭터: 대기 포즈로 복귀.

#### SERVING
- 컵을 드래그하여 픽업대(Takeout Window)로 이동.
- 픽업대 영역에 도달하면:
  - 컵이 **fade + scale down** 연출로 사라짐.
  - **기본 보상 연출:** 코인 `+10` 이 HUD로 날아감 + 뾰로롱 효과음.
  - **Soft Order 보상 연출 (조건 충족 시):** 기본 보상 아래에 다른 색(금색/파스텔 핑크)으로 `+5 ✨` 추가 표시 (§6.4 참고).
- **서빙 직전 현재 컵 조합을 Recipe 히스토리에 자동 저장** (§11.2 참고).
- 0.5초 후 → IDLE (새 빈 컵 등장, 새 Soft Order 롤).

---

## 3. 재료 시스템 (Ingredients)

### 3.1 v1 재료 목록

| 이름 | Category | Layer | 투입 연출 | 단계 | 색상/비주얼 |
|------|----------|-------|----------|------|------------|
| 밀크티 | base | body | 수위 상승 tween | 1/3 → 2/3 → full | `#D4A574` |
| 타로 | base | body | 수위 상승 tween | 1/3 → 2/3 → full | `#B8A0D2` |
| 말차 | base | body | 수위 상승 tween | 1/3 → 2/3 → full | `#A8C686` |
| 펄 (타피오카) | topping | bottom | bounce 낙하 | 소량 / 많음 | 검은 동그란 알갱이 |
| 젤리 | topping | bottom | bounce 낙하 | 소량 / 많음 | 반투명 큐브 |
| 오레오 크럼블 | topping | bottom | 뿌려지는 느낌 | 소량 / 많음 | 검은/갈색 부스러기 |
| 크림/foam | topping | top | 뭉실 scale up | 있음 / 없음 | 흰색 뭉실 |
| 시럽 드리즐 | topping | top | 흘러내리는 tween | 있음 / 없음 | 카라멜/초코 색상 |

### 3.2 컵 자동 레이어 정렬

컵 내부는 **고정 레이어 3개**로 구성. 재료 투입 순서와 무관하게 항상 이 순서로 렌더링:

```
┌─────────────┐
│  Layer 3    │  ← top: foam, 크림, 시럽 드리즐
│  (top)      │     마지막에 렌더링, 항상 최상단
│─────────────│
│             │
│  Layer 2    │  ← body: 액체 (밀크티/타로/말차)
│  (middle)   │     색상 tweening, 수위 표현
│             │
│─────────────│
│  Layer 1    │  ← bottom: 펄, 젤리, 오레오 크럼블
│  (bottom)   │     바닥에 쌓이는 것들
└─────────────┘
```

**동작 원리:**
- 각 재료는 `layer` 속성으로 렌더링 위치가 결정됨.
- 플레이어가 cream을 먼저 탭해도 → `layer: 'top'`이므로 상단에 배치.
- 이후 액체를 탭하면 → 액체가 body layer에 차오르면서, top layer가 자연스럽게 위로 밀려 올라감 (tween).
- 정답/오답 없음. 어떤 순서로 넣든 물리적으로 자연스러운 결과.

### 3.3 재료 → 비주얼 매핑 규칙

- **Base(액체):** 탭 1회 = 수위 1/3 상승. 최대 3탭 (full). tween 0.4초, easeOut.
  - 복수 Base 투입 시 색상 tweening (예: 밀크티 + 말차 = 중간 색상).
  - 같은 Base 추가 탭 → 수위만 올라감.
- **Bottom Topping (펄/젤리/오레오):** 탭 1회 = 소량 스프라이트. 탭 2회+ = 많음 스프라이트.
  - 투입 시 bounce 낙하 애니메이션 (위에서 떨어져 바닥에 통통).
- **Top Topping (크림/시럽):** 탭 1회 = 추가. 추가 탭 없음 (1회만 허용).
  - 크림: 뭉실 scale up (`scale: [0, 1.1, 1]`, spring).
  - 시럽: 위에서 흘러내리는 tween path.
- **조합에 따라 완성품 외형이 달라짐.** 모든 조합이 고유한 결과물.

### 3.4 재료통 탭 연출 (재료 디스펜서 측)

탭한 재료통에서 발생하는 피드백. 가성비 순서:

1. **(필수)** 하이라이트 — 밝기 up 또는 테두리 glow. CSS filter.
2. **(필수)** 재료통 bounce — `scale: [1, 0.95, 1]` spring, 0.3초.
3. **(선택, v1 후반)** 액체 디스펜서 레버 눌림 — 스프라이트 1장 추가.
4. **(v2)** 재료가 통에서 컵까지 날아가는 arc path 파티클.

v1에서는 1 + 2만 구현. 탭 → 재료통 bounce + 캐릭터 도구 전환 + 컵에 재료 등장, 이 세 가지 동시 반응으로 충분.

---

## 4. 캐릭터 시스템

### 4.1 방향 & 포즈

- **방향 전환 없음.** 캐릭터는 카운터 뒤 고정 위치에서 아이소메트릭 정면(약간 좌측)을 봄.
- **도구 기반 액션 표현:** 재료 카테고리에 따라 들고 있는 도구가 바뀜.

### 4.2 포즈 목록 (총 5장)

| # | 포즈 | 트리거 | 설명 |
|---|------|--------|------|
| 1 | **대기** | IDLE, READY_TO_SERVE | 기본 서있는 자세 |
| 2 | **피처 들기** | Base(액체) 탭 시 | 작은 pitcher를 들고 따르는 동작 |
| 3 | **스쿱 들기** | Bottom Topping 탭 시 | 국자/스쿱으로 퍼 넣는 동작 (전 bottom topping 공용) |
| 4 | **뿌리기** | Top Topping 탭 시 | 짤주머니/소스병으로 위에서 뿌리는 동작 (전 top topping 공용) |
| 5 | **컵 잡기** | SHAKING 상태 | 양손으로 컵을 잡고 흔드는 동작 |

- 포즈 전환: 탭 시 즉시 교체, 0.5초 후 탭 없으면 대기 포즈로 복귀.
- 각 도구 포즈는 해당 layer의 모든 재료에 공용 (게임적 허용).

---

## 5. UI 레이아웃 (Single Scene)

아이소메트릭 카페 뷰. 모든 요소가 한 화면에 공존.

```
┌─────────────────────────────────────┐
│  [$] 140                            │  ← HUD (v1: 코인만)
│                                     │
│  [재료선반 - Bottom Topping]          │  ← 펄, 젤리, 오레오 크럼블
│   TAP  TAP  TAP                     │
│                                     │
│  [재료선반 - Top Topping]             │  ← 크림, 시럽
│   TAP  TAP                          │
│                                     │
│  [음료 디스펜서 - Base]     [메뉴판]   │  ← 밀크티, 타로, 말차
│   TAP  TAP  TAP                     │
│                                     │
│       [캐릭터]  [작업대]              │  ← 캐릭터 + 컵
│                  🥤                  │
│              [DONE/SHAKE/SWIPE]     │  ← 컵 위 동일 위치에 상태별 버튼/인디케이터 교체
│                                     │
│  [⚙️]              [픽업대]          │  ← 좌하: 세팅, 우하: 픽업대
│                   💬"초록초록~"       │  ← Soft Order 말풍선 (50% 확률 등장)
│                   "PICKUP"          │
└─────────────────────────────────────┘
```

### 5.1 인터랙션 인디케이터 (컵 위, 동일 위치에서 교체)

| 인디케이터 | 표시 조건 | 비주얼 |
|-----------|----------|--------|
| `TAP` (재료통 위) | IDLE / FILLING 상태 | 둥근 버블, bobbing 애니메이션 |
| `DONE ✓` (컵 위) | FILLING 상태, Base 1종 이상 | 체크 버튼 |
| `SHAKE` (컵 위) | READY_TO_SHAKE 상태, 뚜껑 장착 후 | 흔들기 시작 버튼 |
| `SWIPE ←→` (컵 위) | SHAKING 상태 | 좌우 화살표, 슬라이딩 애니메이션 |
| `DRAG →` (컵 위) | READY_TO_SERVE 상태 | 픽업대 방향 화살표 |

컵 위 버튼/인디케이터는 항상 **하나만** 표시. 상태별 교체.

---

## 6. Soft Order 시스템 (느슨한 주문)

### 6.1 개요

- 손님 캐릭터 없이 "보이지 않는 손님"의 리퀘스트를 표현.
- **optional.** 만족시키지 않아도 기본 보상은 항상 받음. 만족 시 추가 보상.
- "실패 없음" 원칙 유지. 오답 패널티 없음.

### 6.2 표시 위치 & 등장 규칙

- **위치:** 픽업대(Takeout Window) 위 말풍선.
- **등장:** 새 컵이 IDLE로 배치될 때 **50% 확률**로 활성화.
  - 말풍선 bounce-in 애니메이션으로 등장.
  - 활성화되지 않으면 말풍선 없음 (평상시 상태).
- **소멸:** 해당 음료를 서빙하면 말풍선 사라짐 (다음 IDLE에서 다시 롤).

### 6.3 Soft Order 타입 (v1: 4종)

| ID | 힌트 텍스트 | 만족 조건 | 힌트 재료 |
|----|-----------|----------|----------|
| `green` | "초록초록한 게 마시고 싶어~" | 말차 Base 포함 | 말차 |
| `purple` | "보라보라한 게 땡겨!" | 타로 Base 포함 | 타로 |
| `round` | "동글동글한 게 들어간 거!" | Bottom Topping 1종 이상 | 펄, 젤리 |
| `sweet` | "달콤한 거 올려주세요~" | Top Topping 1종 이상 | 크림, 시럽 |

- 조건은 **단일 조건**만. 복합 조건 없음 (v2 확장).
- Soft Order 풀에서 랜덤 선택.

### 6.4 Soft Order 인터랙션 흐름

1. **IDLE 진입** → 50% 확률로 픽업대 위에 말풍선 팝업.
2. **말풍선 표시** → 힌트 텍스트 (예: "초록초록한 게 마시고 싶어~").
3. **힌트 이펙트** → 해당 조건에 매칭되는 재료통들이 **subtle glow pulse** 반복.
   - 강한 하이라이트가 아닌 부드러운 힌트. 연결을 플레이어가 직접 발견하는 재미.
4. **조건 충족** → 해당 재료를 컵에 넣는 순간:
   - 말풍선 우측 상단에 **✓ 체크마크** 등장.
   - 작은 뾰로롱 효과음.
   - 힌트 glow 해제.
5. **서빙 (조건 충족)** → 기본 보상 `+10` + 추가 보상 `+5 ✨` (다른 색으로 분리 표시).
6. **서빙 (조건 미충족)** → 기본 보상 `+10`만. 말풍선 조용히 사라짐.

### 6.5 보상 연출 상세

- **기본 보상:** 흰색/기본색 `+10` → HUD로 날아감.
- **Soft Order 보상 (충족 시):** 기본 보상 아래에 금색/파스텔 핑크 `+5 ✨` 추가 표시 → HUD로 날아감.
- 두 보상은 분리 표시. 총합 아님. 플레이어가 "추가 보상 받았다"를 명확히 인지.

---

## 7. 픽업대 (Takeout Window)

- **위치:** 화면 우측 하단, 카운터 끝.
- **비주얼:** 작은 창문 + "PICKUP" 사인.
- **세계관:** "보이지 않는 손님"이 가져감. 24시간 오픈 카페.
- **인터랙션:**
  - `READY_TO_SERVE` 상태에서 컵을 드래그하여 픽업대 영역에 드롭.
  - 드롭 시 컵이 fade out + scale down.
- **Soft Order 말풍선:** 픽업대 위에 표시 (§6 참고).
- **확장성:** v2에서 손님 추가 시 창문 뒤에서 손이 나오는 연출 등으로 확장 가능.

---

## 8. 보상 시스템 (v1)

- **기본 보상:** 음료 1잔 서빙 = 코인 +10.
- **Soft Order 보상:** 조건 충족 시 추가 코인 +5.
- **보상 연출:** §6.5 참고.
- **코인 용도:** v1에서는 없음. 누적만. (v2에서 재료 해금, 카페 꾸미기 등.)
- **코인 로깅:** `addCoins(amount, reason)` 형태. reason 예: `'serve_drink'`, `'soft_order_bonus'`.

---

## 9. 세션 구조

- **무한 루프.** "한 판"의 개념 없음.
- 플레이어가 앱을 닫을 때까지 IDLE → SERVING → IDLE 반복.
- v1은 의도적으로 endless. Session-based progression은 v2 feature.
- 진행 상태 저장: 코인 누적값 + Recipe 히스토리를 localStorage에 저장.

---

## 10. 사운드 디자인 (ASMR)

| Trigger | Sound | Loop? |
|---------|-------|-------|
| Base 액체 투입 | 졸졸 붓는 소리 | No |
| Bottom Topping 투입 | 폭신한 톡톡 소리 (bounce와 동기화) | No |
| Top Topping 투입 | 뭉실 / 쭈욱 짜는 소리 | No |
| 재료통 TAP | 가벼운 탭 피드백음 | No |
| Shaking 중 | 얼음 덜컹덜컹 | Yes (swipe 중만) |
| 뚜껑 씌우기 | 딸깍 | No |
| Soft Order 등장 | 작은 팝 (말풍선 등장) | No |
| Soft Order 충족 | 작은 뾰로롱 (✓ 등장) | No |
| 서빙 완료 | 뾰로롱 + 코인 짤랑 | No |
| BGM | 잔잔한 카페 앰비언스 | Yes (전체) |

사운드 라이브러리: **Howler.js**
- 모든 효과음은 Web Audio API 기반, 모바일 터치 이벤트에 연결.
- 첫 터치(START 버튼) 시 AudioContext 초기화 필수.

---

## 11. 상태 관리

라이브러리: **Zustand**

### 11.1 Game Store

```typescript
interface GameState {
  // Cup
  cupState: 'IDLE' | 'FILLING' | 'READY_TO_SHAKE' | 'SHAKING' | 'READY_TO_SERVE' | 'SERVING';
  cupIngredients: CupIngredient[];
  cupLiquidColor: string;
  cupLiquidLevel: number;           // 0, 0.33, 0.66, 1

  // Shaking
  shakeGauge: number;               // 0~100

  // Soft Order
  softOrder: SoftOrder | null;
  isSoftOrderFulfilled: boolean;

  // Economy
  coins: number;
  coinLog: CoinLogEntry[];

  // Recipe History
  recipes: Recipe[];

  // Character
  characterPose: 'idle' | 'pitcher' | 'scoop' | 'drizzle' | 'shake';

  // Title
  showTitle: boolean;                // true면 타이틀 오버레이 표시

  // Actions
  dismissTitle: () => void;
  addIngredient: (ingredient: Ingredient) => void;   // 내부에서 softOrder 조건 체크
  finishFilling: () => void;
  startShaking: () => void;          // SHAKE 버튼 탭 시
  updateShakeGauge: (delta: number) => void;
  serveDrink: () => void;            // addRecipe + addCoins + resetCup + rollSoftOrder
  resetCup: () => void;
  rollSoftOrder: () => void;         // 50% 확률로 새 Soft Order 생성
}
```

### 11.2 데이터 타입

```typescript
interface Ingredient {
  id: string;
  name: string;
  nameKo: string;
  category: 'base' | 'topping';
  layer: 'bottom' | 'body' | 'top';
  color?: string;
  sprite?: string;
  tool: 'pitcher' | 'scoop' | 'drizzle';
}

interface CupIngredient {
  ingredientId: string;
  quantity: number;
}

interface Recipe {
  id: string;
  ingredients: CupIngredient[];
  liquidColor: string;
  createdAt: number;
}

interface CoinLogEntry {
  amount: number;
  reason: string;                    // 'serve_drink' | 'soft_order_bonus'
  timestamp: number;
}

interface SoftOrder {
  id: string;
  hintText: string;                  // "초록초록한 게 마시고 싶어~"
  condition: SoftOrderCondition;
  bonusCoins: number;
  hintIngredientIds: string[];       // 힌트 glow 대상 재료 ID 목록
}

interface SoftOrderCondition {
  type: 'has_base' | 'has_bottom_topping' | 'has_top_topping';
  ingredientIds?: string[];          // 특정 재료 제한 (선택적)
}
```

### 11.3 재료 데이터 (분리 파일: `src/data/ingredients.js`)

```javascript
export const INGREDIENTS = [
  // Base
  { id: 'milktea', nameKo: '밀크티', category: 'base', layer: 'body', color: '#D4A574', tool: 'pitcher' },
  { id: 'taro', nameKo: '타로', category: 'base', layer: 'body', color: '#B8A0D2', tool: 'pitcher' },
  { id: 'matcha', nameKo: '말차', category: 'base', layer: 'body', color: '#A8C686', tool: 'pitcher' },

  // Bottom Topping
  { id: 'pearl', nameKo: '펄', category: 'topping', layer: 'bottom', sprite: 'pearl', tool: 'scoop' },
  { id: 'jelly', nameKo: '젤리', category: 'topping', layer: 'bottom', sprite: 'jelly', tool: 'scoop' },
  { id: 'oreo', nameKo: '오레오 크럼블', category: 'topping', layer: 'bottom', sprite: 'oreo', tool: 'scoop' },

  // Top Topping
  { id: 'cream', nameKo: '크림', category: 'topping', layer: 'top', sprite: 'cream', tool: 'drizzle' },
  { id: 'syrup', nameKo: '시럽', category: 'topping', layer: 'top', sprite: 'syrup', tool: 'drizzle' },
];
```

### 11.4 Soft Order 데이터 (분리 파일: `src/data/softOrders.js`)

```javascript
export const SOFT_ORDERS = [
  {
    id: 'green',
    hintText: '초록초록한 게 마시고 싶어~',
    condition: { type: 'has_base', ingredientIds: ['matcha'] },
    bonusCoins: 5,
    hintIngredientIds: ['matcha'],
  },
  {
    id: 'purple',
    hintText: '보라보라한 게 땡겨!',
    condition: { type: 'has_base', ingredientIds: ['taro'] },
    bonusCoins: 5,
    hintIngredientIds: ['taro'],
  },
  {
    id: 'round',
    hintText: '동글동글한 게 들어간 거!',
    condition: { type: 'has_bottom_topping' },
    bonusCoins: 5,
    hintIngredientIds: ['pearl', 'jelly'],
  },
  {
    id: 'sweet',
    hintText: '달콤한 거 올려주세요~',
    condition: { type: 'has_top_topping' },
    bonusCoins: 5,
    hintIngredientIds: ['cream', 'syrup'],
  },
];
```

---

## 12. 애니메이션 사양

라이브러리: **Framer Motion**

| 대상 | 애니메이션 | 파라미터 |
|------|----------|---------|
| Bottom Topping 투입 | bounce 낙하 (위→아래) | `type: "spring", stiffness: 300, damping: 15` |
| Base 액체 수위 상승 | height tween | `duration: 0.4, ease: "easeOut"` |
| Base 색상 변환 | color tween | `duration: 0.4` |
| Top layer 떠오르기 | y position tween | 액체 수위에 연동, `duration: 0.4` |
| Top Topping 크림 | scale up | `scale: [0, 1.1, 1], type: "spring"` |
| Top Topping 시럽 | y path tween | 위에서 흘러내리는 경로 |
| 재료통 bounce | scale pulse | `scale: [1, 0.95, 1], duration: 0.3` |
| Soft Order 힌트 glow | opacity pulse | `opacity: [0.5, 1], repeat: Infinity, duration: 1.2` |
| Soft Order 말풍선 | bounce in | `scale: [0, 1.1, 1], type: "spring"` |
| Soft Order ✓ | pop in | `scale: [0, 1.2, 1], duration: 0.3` |
| 캐릭터 포즈 전환 | sprite swap | 즉시 교체, 0.5초 후 idle 복귀 |
| 뚜껑 씌우기 | scale + y translate | `duration: 0.5` |
| 컵 흔들기 (Shaking) | rotate (좌우) | swipe delta에 비례, `spring` |
| 서빙 (컵 사라짐) | scale down + fade | `duration: 0.3` |
| 코인 날아감 | position tween | 픽업대 → HUD, `duration: 0.6` |
| 보너스 코인 | position tween | 기본 코인 아래에서 출발, `delay: 0.2` |
| TAP 인디케이터 | y bobbing | `repeat: Infinity, duration: 0.8, yoyo: true` |
| 타이틀 오버레이 | fade out | `opacity: 1→0, duration: 0.6` |

---

## 13. 기술 스택 & 빌드

| Layer | Tool | 비고 |
|-------|------|------|
| Framework | React 18+ | SPA, no routing |
| Build | Vite | fast HMR, small bundle |
| Animation | Framer Motion | spring physics |
| Sound | Howler.js | ASMR layering, mobile support |
| State | Zustand | lightweight, no boilerplate |
| APK Wrapping | Capacitor | fullscreen, sound permissions, vibration |
| Art Assets | PNG sprites | isometric pre-rendered |

### 13.1 프로젝트 구조 (권장)

```
src/
├── App.jsx
├── components/
│   ├── Scene.jsx              # 아이소메트릭 카페 전체 레이아웃
│   ├── TitleOverlay.jsx       # 타이틀 오버레이 (게임 위에 겹침)
│   ├── Cup.jsx                # 컵 (cupState + layer 렌더링)
│   ├── CupLayer.jsx           # 개별 레이어 (bottom/body/top)
│   ├── IngredientStation.jsx  # 재료통 + TAP 인디케이터
│   ├── Character.jsx          # 캐릭터 (포즈 스프라이트 교체)
│   ├── CupAction.jsx          # DONE / SHAKE / SWIPE / DRAG (상태별 교체)
│   ├── ShakeGauge.jsx         # Shaking 게이지
│   ├── TakeoutWindow.jsx      # 픽업대
│   ├── SoftOrderBubble.jsx    # Soft Order 말풍선 + ✓
│   ├── CoinHUD.jsx            # 상단 코인
│   └── RewardPopup.jsx        # 코인 보상 연출 (+10, +5 ✨)
├── store/
│   └── gameStore.js           # Zustand store
├── data/
│   ├── ingredients.js         # 재료 데이터 (분리)
│   └── softOrders.js          # Soft Order 데이터 (분리)
├── hooks/
│   ├── useSwipe.js            # swipe 제스처
│   └── useDrag.js             # 드래그 제스처
├── sounds/
│   └── ...
└── assets/
    └── ...
```

---

## 14. Title Screen

- **방식:** 길건너 친구들 스타일. 게임이 이미 로드된 상태에서 반투명 오버레이로 타이틀 표시.
- **구성:** 게임 로고 + `[START]` 버튼. 배경에 카페 씬이 보임.
- **인터랙션:** START 탭 → AudioContext 초기화 → 오버레이 fade out (0.6초) → 바로 게임 시작 (cupState = IDLE).
- **구현:** `showTitle` boolean으로 `TitleOverlay` 컴포넌트 조건부 렌더링. 씬 교체 아님.

---

## 15. 서버 & 확장성 (v1 방침)

### 15.1 v1: 서버 없음, 로컬 저장

- 유저 인증 없음. 완전 오프라인.
- 모든 데이터(코인, Recipe 히스토리)는 localStorage에 저장.
- 클라우드 저장, 리더보드, Analytics SDK 모두 불필요.

### 15.2 v2 확장을 위해 v1에서 미리 해두는 것

추가 공수 거의 0이지만 향후 마이그레이션 고통을 줄이는 설계:

1. **Recipe 히스토리 자동 저장** — `serveDrink()` 시 cupIngredients → Recipe로 변환하여 push. 도감 데이터 소스.
2. **재료 데이터 분리** — `ingredients.js`. 서버 API 대체 시 이 파일만 교체.
3. **Soft Order 데이터 분리** — `softOrders.js`. 서버에서 동적 로딩으로 대체 가능.
4. **코인 로깅** — `addCoins(amount, reason)`. 밸런싱 추적용.
5. **상태 직렬화** — Zustand store를 JSON.stringify 가능한 순수 데이터로 유지.

### 15.3 서버가 필요해지는 시점

- 손님 시스템 도입 (주문 데이터)
- 소셜 기능 (리더보드, 친구)
- 클라우드 세이브
- → Supabase 등 BaaS 하나 붙이면 됨.

---

## 16. 에셋 체크리스트

### 16.1 배경 & 환경

| 에셋 | 파일 | 비고 |
|------|------|------|
| 카페 배경 (아이소메트릭) | `bg_cafe.png` | 전체 배경. 선반, 카운터, 바닥 등 포함 |
| 픽업대 | `takeout_window.png` | 배경에 포함 또는 별도 오버레이 |
| 메뉴판 | `menu_board.png` | 배경에 포함 또는 별도 |

### 16.2 캐릭터 스프라이트

| 에셋 | 파일 | 비고 |
|------|------|------|
| 대기 포즈 | `char_idle.png` | 기본 |
| 피처 들기 | `char_pitcher.png` | Base 탭 시 |
| 스쿱 들기 | `char_scoop.png` | Bottom Topping 탭 시 |
| 뿌리기 | `char_drizzle.png` | Top Topping 탭 시 |
| 컵 잡기 | `char_shake.png` | SHAKING 상태 |

### 16.3 컵 & 재료

| 에셋 | 파일 | 비고 |
|------|------|------|
| 빈 컵 | `cup_empty.png` | 투명 컵 |
| 뚜껑 | `cup_lid.png` | 뚜껑 씌우기 애니메이션용 |
| 빨대 | `cup_straw.png` | (선택적) |
| 펄 - 소량 | `topping_pearl_sm.png` | 알갱이 3-4개 |
| 펄 - 많음 | `topping_pearl_lg.png` | 알갱이 7-8개 |
| 젤리 - 소량 | `topping_jelly_sm.png` | |
| 젤리 - 많음 | `topping_jelly_lg.png` | |
| 오레오 - 소량 | `topping_oreo_sm.png` | |
| 오레오 - 많음 | `topping_oreo_lg.png` | |
| 크림 | `topping_cream.png` | 뭉실 올라오기 |
| 시럽 | `topping_syrup.png` | 흘러내리기 |

- Base 액체는 스프라이트 불필요. 컬러 rect + height로 표현.

### 16.4 재료통 (디스펜서)

| 에셋 | 파일 | 비고 |
|------|------|------|
| 밀크티 디스펜서 | `station_milktea.png` | 또는 배경에 포함 |
| 타로 디스펜서 | `station_taro.png` | |
| 말차 디스펜서 | `station_matcha.png` | |
| 펄 통 | `station_pearl.png` | |
| 젤리 통 | `station_jelly.png` | |
| 오레오 통 | `station_oreo.png` | |
| 크림 도구 | `station_cream.png` | |
| 시럽 병 | `station_syrup.png` | |

> **참고:** 재료통이 배경 이미지에 포함된 경우, 별도 에셋 불필요. 대신 배경 위에 투명 터치 영역(hitbox)만 배치하고, 탭 시 CSS filter로 하이라이트 + bounce 처리.

### 16.5 UI

| 에셋 | 파일 | 비고 |
|------|------|------|
| 코인 아이콘 | `icon_coin.png` | HUD + 보상 연출 |
| TAP 버블 | `bubble_tap.png` | 또는 CSS/SVG로 구현 |
| 세팅 아이콘 | `icon_settings.png` | |
| 로고 (타이틀) | `logo.png` | 타이틀 화면용 |
| 말풍선 프레임 | `bubble_speech.png` | Soft Order용. 또는 CSS로 구현 |
| 체크마크 | `icon_check.png` | Soft Order ✓. 또는 CSS/SVG |

### 16.6 사운드

| 에셋 | 파일 | 비고 |
|------|------|------|
| BGM | `bgm_cafe.mp3` | 루프, 잔잔한 앰비언스 |
| 액체 투입 | `sfx_pour.mp3` | 졸졸 |
| 토핑 투입 | `sfx_plop.mp3` | 톡톡 |
| 크림/시럽 투입 | `sfx_squeeze.mp3` | 뭉실/쭈욱 |
| 재료통 탭 | `sfx_tap.mp3` | 가벼운 피드백 |
| 뚜껑 | `sfx_lid.mp3` | 딸깍 |
| 흔들기 | `sfx_shake.mp3` | 얼음 덜컹, 루프 |
| 서빙 | `sfx_serve.mp3` | 뾰로롱 |
| 코인 | `sfx_coin.mp3` | 짤랑 |
| Soft Order 등장 | `sfx_bubble_pop.mp3` | 작은 팝 |
| Soft Order 충족 | `sfx_check.mp3` | 작은 뾰로롱 |

---

## 17. Deferred to v2+ (의도적으로 미루는 기능)

| Feature | 설명 | 우선도 |
|---------|------|-------|
| 손님 시스템 | 캐릭터 입장, 주문 말풍선, 만족도 | High |
| 복합 Soft Order | "말차 + 펄" 같은 다중 조건 주문 | High |
| 레시피 도감 | 만든 조합 기록, 컬렉션 UI | High |
| 재료 해금 | 코인으로 새 재료 unlock | Medium |
| 레벨 시스템 | 경험치, 카페 레벨업 | Medium |
| 타이머/세션 | 시간 제한 모드, 데일리 챌린지 | Medium |
| 카페 꾸미기 | 인테리어 커스터마이징 | Medium |
| 탭-홀드 액체 투입 | hold 길이로 수위 연속 조절 | Medium |
| 재료 arc path 파티클 | 통→컵 날아가는 연출 | Medium |
| 리드믹 탭 콤보 | 숙련도 기반 보너스 | Low |
| 음료 커스터마이징 | 얼음 양, 당도 조절 | Low |
| 소셜/리더보드 | 친구 비교, 공유 | Low |

---

## 18. MVP 완성 기준 (Definition of Done)

v1이 "출시 가능"하려면 아래가 모두 동작해야 함:

- [ ] Title Overlay (길건너 친구들 방식) → START → fade out → 게임 시작
- [ ] 재료 TAP → 컵에 재료 추가 (layer 자동 정렬)
- [ ] Base 투입 시 액체 수위 상승 + 색상 tweening
- [ ] Bottom Topping 투입 시 bounce 애니메이션 + 소량/많음
- [ ] Top Topping 투입 시 scale up 연출
- [ ] 재료통 탭 리액션 (highlight + bounce)
- [ ] 캐릭터 도구 포즈 전환 (5종)
- [ ] DONE 버튼 → 뚜껑 → SHAKE 버튼 → SWIPE 인디케이터 (동일 위치 교체)
- [ ] 좌우 swipe → 게이지 → 100% 달성
- [ ] 컵 드래그 → 픽업대 → 코인 보상
- [ ] Soft Order 시스템 (50% 등장, 힌트 glow, ✓ 체크, 보너스 코인)
- [ ] 무한 루프 (다시 빈 컵)
- [ ] 코인 누적 & HUD 표시
- [ ] Recipe 히스토리 자동 저장 (localStorage)
- [ ] ASMR 효과음 최소 5종 (액체, 토핑, 흔들기, 서빙, Soft Order)
- [ ] BGM 루프
- [ ] Capacitor APK 빌드 성공
- [ ] 9:16 portrait 레이아웃, 모바일 터치 최적화
