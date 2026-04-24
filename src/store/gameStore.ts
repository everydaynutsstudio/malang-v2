import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INGREDIENTS_MAP, type Ingredient } from '../data/ingredients';
import { SOFT_ORDERS, type SoftOrderData, type SoftOrderCondition } from '../data/softOrders';

// ── Types ──────────────────────────────────────────────────────────────────

export type CupState =
  | 'IDLE'
  | 'FILLING'
  | 'READY_TO_SHAKE'
  | 'SHAKING'
  | 'READY_TO_SERVE'
  | 'SERVING';

export type CharacterPose = 'idle' | 'pitcher' | 'scoop' | 'drizzle' | 'shake';

export interface CupIngredient {
  ingredientId: string;
  quantity: number;
}

export interface SoftOrder {
  id: string;
  hintText: string;
  condition: SoftOrderCondition;
  bonusCoins: number;
  hintIngredientIds: string[];
}

export interface Recipe {
  id: string;
  ingredients: CupIngredient[];
  liquidColor: string;
  createdAt: number;
}

export interface CoinLogEntry {
  amount: number;
  reason: string;
  timestamp: number;
}

// ── State Machine: 허용된 전환 맵 ──────────────────────────────────────────
//
//   IDLE → FILLING           (addIngredient: 첫 재료 탭)
//   FILLING → READY_TO_SHAKE (finishFilling: DONE 버튼, Base 1종 이상)
//   READY_TO_SHAKE → SHAKING (startShaking: SHAKE 버튼 탭)
//   SHAKING → READY_TO_SERVE (updateShakeGauge: 게이지 100%)
//   READY_TO_SERVE → SERVING (serveDrink: 컵을 픽업대에 드롭)
//   SERVING → IDLE           (auto: 0.5초 후, 보상 연출 완료)

const ALLOWED_TRANSITIONS: Partial<Record<CupState, CupState[]>> = {
  IDLE:            ['FILLING'],
  FILLING:         ['READY_TO_SHAKE'],
  READY_TO_SHAKE:  ['SHAKING'],
  SHAKING:         ['READY_TO_SERVE'],
  READY_TO_SERVE:  ['SERVING'],
  SERVING:         ['IDLE'],
};

function transition(
  current: CupState,
  next: CupState,
  trigger: string,
  setter: (s: Partial<{ cupState: CupState }>) => void
): boolean {
  const allowed = ALLOWED_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    console.warn(`[Malang] ✗ 전환 불가: ${current} → ${next} (trigger: ${trigger})`);
    return false;
  }
  console.log(`[Malang] ✓ ${current} → ${next}  (${trigger})`);
  setter({ cupState: next });
  return true;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function blendColors(colors: string[]): string {
  if (colors.length === 0) return '#FFFFFF';
  if (colors.length === 1) return colors[0];

  const parsed = colors.map(hex => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }));
  const avg = parsed.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
    { r: 0, g: 0, b: 0 }
  );
  const n = parsed.length;
  const r = Math.round(avg.r / n).toString(16).padStart(2, '0');
  const g = Math.round(avg.g / n).toString(16).padStart(2, '0');
  const b = Math.round(avg.b / n).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function checkSoftOrderCondition(condition: SoftOrderCondition, ingredients: CupIngredient[]): boolean {
  switch (condition.type) {
    case 'has_base':
      if (condition.ingredientIds) {
        return ingredients.some(ci => condition.ingredientIds!.includes(ci.ingredientId));
      }
      return ingredients.some(ci => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base');
    case 'has_bottom_topping':
      return ingredients.some(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'bottom');
    case 'has_top_topping':
      return ingredients.some(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'top');
  }
}

function computeLiquidColor(ingredients: CupIngredient[]): string {
  const baseColors = ingredients
    .filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base')
    .map(ci => INGREDIENTS_MAP[ci.ingredientId]?.color)
    .filter((c): c is string => !!c);
  return blendColors(baseColors);
}

function computeLiquidLevel(ingredients: CupIngredient[]): number {
  const total = ingredients
    .filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'body')
    .reduce((sum, ci) => sum + ci.quantity, 0);
  if (total === 0) return 0;
  if (total === 1) return 0.33;
  if (total === 2) return 0.66;
  return 1;
}

// ── Store ──────────────────────────────────────────────────────────────────

interface GameState {
  // Cup
  cupState: CupState;
  cupIngredients: CupIngredient[];
  cupLiquidColor: string;
  cupLiquidLevel: number;

  // Shaking
  shakeGauge: number;

  // 서빙 횟수 — Cup key로 사용해 새 컵 리마운트 트리거
  serveCount: number;

  // Soft Order
  softOrder: SoftOrder | null;
  isSoftOrderFulfilled: boolean;

  // Economy
  coins: number;
  coinLog: CoinLogEntry[];

  // Recipe History
  recipes: Recipe[];

  // Character
  characterPose: CharacterPose;

  // Title
  showTitle: boolean;

  // Actions
  dismissTitle: () => void;

  // §2.2 IDLE → FILLING: 재료 탭 1회
  addIngredient: (ingredient: Ingredient) => void;

  // §2.2 FILLING → READY_TO_SHAKE: DONE ✓ 버튼 (Base 1종 이상 조건)
  finishFilling: () => void;

  // §2.2 READY_TO_SHAKE → SHAKING: SHAKE 버튼 탭
  startShaking: () => void;

  // §2.2 SHAKING → READY_TO_SERVE: swipe delta 누적, 100% 도달 시 자동 전환
  updateShakeGauge: (delta: number) => void;

  // §2.2 READY_TO_SERVE → SERVING → IDLE: 픽업대 드롭 → 보상 → 0.5초 후 IDLE
  serveDrink: () => void;

  resetCup: () => void;
  // FILLING 상태에서 컵 내용물 전체 초기화 → IDLE 복귀 (쓰레기통 버튼)
  clearCup: () => void;
  rollSoftOrder: () => void;
  setCharacterPose: (pose: CharacterPose) => void;
}

let poseTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────
      cupState: 'IDLE',
      cupIngredients: [],
      cupLiquidColor: '#FFFFFF',
      cupLiquidLevel: 0,
      shakeGauge: 0,
      serveCount: 0,
      softOrder: null,
      isSoftOrderFulfilled: false,
      coins: 0,
      coinLog: [],
      recipes: [],
      characterPose: 'idle',
      showTitle: true,

      // ── Actions ────────────────────────────────────────────────────────────

      dismissTitle: () => {
        console.log('[Malang] 타이틀 dismissed → 게임 시작');
        set({ showTitle: false });
      },

      // IDLE → FILLING (첫 탭) / FILLING → FILLING (추가 탭)
      addIngredient: (ingredient) => {
        const { cupState, cupIngredients, softOrder } = get();

        // 가드: IDLE 또는 FILLING 상태에서만 허용
        if (cupState !== 'IDLE' && cupState !== 'FILLING') {
          console.warn(`[Malang] addIngredient 무시 — 현재 상태: ${cupState}`);
          return;
        }

        // Top topping은 1회만
        if (ingredient.layer === 'top') {
          const already = cupIngredients.some(ci => ci.ingredientId === ingredient.id);
          if (already) {
            console.warn(`[Malang] ${ingredient.nameKo} — top topping 중복 탭 무시`);
            return;
          }
        }

        // Base는 최대 3 unit (수위 full)
        if (ingredient.layer === 'body') {
          const baseTotal = cupIngredients
            .filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'body')
            .reduce((sum, ci) => sum + ci.quantity, 0);
          if (baseTotal >= 3) {
            console.warn(`[Malang] ${ingredient.nameKo} — base 수위 이미 full, 무시`);
            return;
          }
        }

        const existing = cupIngredients.find(ci => ci.ingredientId === ingredient.id);
        const updated: CupIngredient[] = existing
          ? cupIngredients.map(ci =>
              ci.ingredientId === ingredient.id
                ? { ...ci, quantity: ci.quantity + 1 }
                : ci
            )
          : [...cupIngredients, { ingredientId: ingredient.id, quantity: 1 }];

        const liquidColor = computeLiquidColor(updated);
        const liquidLevel = computeLiquidLevel(updated);

        // Soft Order 조건 체크
        let isSoftOrderFulfilled = get().isSoftOrderFulfilled;
        if (softOrder && !isSoftOrderFulfilled) {
          const justFulfilled = checkSoftOrderCondition(softOrder.condition, updated);
          if (justFulfilled) {
            console.log(`[Malang] ✨ Soft Order 충족! (${softOrder.id}: "${softOrder.hintText}")`);
            isSoftOrderFulfilled = true;
          }
        }

        // 캐릭터 포즈: 탭한 재료의 tool 기준
        const pose: CharacterPose =
          ingredient.tool === 'pitcher' ? 'pitcher' :
          ingredient.tool === 'scoop'   ? 'scoop'   : 'drizzle';

        if (poseTimer) clearTimeout(poseTimer);
        poseTimer = setTimeout(() => {
          useGameStore.setState({ characterPose: 'idle' });
        }, 500);

        // IDLE → FILLING 전환 (첫 탭)
        if (cupState === 'IDLE') {
          console.log(`[Malang] ✓ IDLE → FILLING  (addIngredient: ${ingredient.nameKo})`);
          set({
            cupState: 'FILLING',
            cupIngredients: updated,
            cupLiquidColor: liquidColor,
            cupLiquidLevel: liquidLevel,
            characterPose: pose,
            isSoftOrderFulfilled,
          });
        } else {
          // FILLING 유지 (추가 탭)
          const qty = (existing?.quantity ?? 0) + 1;
          console.log(`[Malang]   FILLING  재료 추가: ${ingredient.nameKo} ×${qty}`);
          set({
            cupIngredients: updated,
            cupLiquidColor: liquidColor,
            cupLiquidLevel: liquidLevel,
            characterPose: pose,
            isSoftOrderFulfilled,
          });
        }
      },

      // FILLING → READY_TO_SHAKE (DONE 버튼)
      finishFilling: () => {
        const { cupState, cupIngredients } = get();

        // 가드: FILLING 상태여야 함
        if (cupState !== 'FILLING') {
          console.warn(`[Malang] finishFilling 무시 — 현재 상태: ${cupState}`);
          return;
        }

        // 가드: Base 1종 이상 필수
        const hasBase = cupIngredients.some(
          ci => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base'
        );
        if (!hasBase) {
          console.warn('[Malang] finishFilling 무시 — Base(액체) 없음');
          return;
        }

        const summary = cupIngredients
          .map(ci => `${INGREDIENTS_MAP[ci.ingredientId]?.nameKo ?? ci.ingredientId}×${ci.quantity}`)
          .join(', ');
        console.log(`[Malang] 컵 구성: [${summary}]`);

        transition(cupState, 'READY_TO_SHAKE', 'finishFilling (DONE 버튼)', set);
      },

      // READY_TO_SHAKE → SHAKING (SHAKE 버튼 탭)
      startShaking: () => {
        const { cupState } = get();

        if (!transition(cupState, 'SHAKING', 'startShaking (SHAKE 버튼)', set)) return;

        set({ shakeGauge: 0, characterPose: 'shake' });
      },

      // SHAKING 유지 + 100% 달성 시 SHAKING → READY_TO_SERVE
      updateShakeGauge: (delta: number) => {
        const { cupState, shakeGauge } = get();

        if (cupState !== 'SHAKING') return;

        const next = Math.min(100, shakeGauge + Math.abs(delta));

        if (next >= 100 && shakeGauge < 100) {
          // 정확히 100% 도달 시점에 한 번만 전환
          set({ shakeGauge: 100 });
          transition('SHAKING', 'READY_TO_SERVE', 'updateShakeGauge (게이지 100%)', set);
          set({ characterPose: 'idle' });
          console.log('[Malang] 뚜껑 열림 → 빨대 연출 → DRAG 인디케이터 표시');
        } else {
          set({ shakeGauge: next });
        }
      },

      // READY_TO_SERVE → SERVING → (0.5초) → IDLE
      serveDrink: () => {
        const { cupState, cupIngredients, cupLiquidColor, softOrder, isSoftOrderFulfilled, coins, coinLog, recipes } = get();

        // READY_TO_SERVE → SERVING
        if (!transition(cupState, 'SERVING', 'serveDrink (픽업대 드롭)', set)) return;

        // 서빙 직전 Recipe 저장
        const recipe: Recipe = {
          id: `recipe_${Date.now()}`,
          ingredients: [...cupIngredients],
          liquidColor: cupLiquidColor,
          createdAt: Date.now(),
        };

        // 보상 계산
        const baseCoins = 10;
        const bonusCoins = softOrder && isSoftOrderFulfilled ? softOrder.bonusCoins : 0;
        const totalCoins = baseCoins + bonusCoins;

        const newCoinLog: CoinLogEntry[] = [
          ...coinLog,
          { amount: baseCoins, reason: 'serve_drink', timestamp: Date.now() },
          ...(bonusCoins > 0
            ? [{ amount: bonusCoins, reason: 'soft_order_bonus', timestamp: Date.now() }]
            : []),
        ];

        console.log(
          `[Malang] 보상: +${baseCoins}` +
          (bonusCoins > 0 ? ` +${bonusCoins}✨ (Soft Order 보너스)` : '') +
          ` → 총 코인: ${coins + totalCoins}`
        );

        set({
          coins: coins + totalCoins,
          coinLog: newCoinLog,
          recipes: [...recipes, recipe],
        });

        // 0.5초 후 컵 초기화 + IDLE 복귀 + Soft Order 롤
        // serveCount 증가 → Scene에서 Cup key 변경 → 새 빈 컵 리마운트
        setTimeout(() => {
          get().resetCup();
          get().rollSoftOrder();
          console.log('[Malang] ✓ SERVING → IDLE  (auto: 서빙 완료 0.5초)');
          set({ cupState: 'IDLE', serveCount: get().serveCount + 1 });
        }, 500);
      },

      resetCup: () => {
        console.log('[Malang] 컵 초기화');
        set({
          cupIngredients: [],
          cupLiquidColor: '#FFFFFF',
          cupLiquidLevel: 0,
          shakeGauge: 0,
          softOrder: null,
          isSoftOrderFulfilled: false,
          characterPose: 'idle',
        });
      },

      // FILLING → IDLE: 쓰레기통 버튼으로 내용물 초기화 + 새 컵 리마운트
      clearCup: () => {
        const { cupState } = get();
        if (cupState !== 'FILLING') return;
        console.log('[Malang] 컵 초기화 (쓰레기통) → IDLE');
        set({
          cupState: 'IDLE',
          cupIngredients: [],
          cupLiquidColor: '#FFFFFF',
          cupLiquidLevel: 0,
          shakeGauge: 0,
          isSoftOrderFulfilled: false,
          characterPose: 'idle',
          serveCount: get().serveCount + 1, // Cup 리마운트 → 새 빈 컵 bounce-in
        });
      },

      rollSoftOrder: () => {
        if (Math.random() < 0.5) {
          const pick = SOFT_ORDERS[Math.floor(Math.random() * SOFT_ORDERS.length)] as SoftOrderData;
          const order: SoftOrder = {
            id: pick.id,
            hintText: pick.hintText,
            condition: pick.condition,
            bonusCoins: pick.bonusCoins,
            hintIngredientIds: pick.hintIngredientIds,
          };
          console.log(`[Malang] 🗨 Soft Order 등장: "${pick.hintText}"`);
          set({ softOrder: order, isSoftOrderFulfilled: false });
        } else {
          console.log('[Malang] Soft Order 없음 (50% 미당첨)');
          set({ softOrder: null, isSoftOrderFulfilled: false });
        }
      },

      setCharacterPose: (pose) => set({ characterPose: pose }),
    }),
    {
      name: 'malang-save',
      partialize: (state) => ({
        coins: state.coins,
        coinLog: state.coinLog,
        recipes: state.recipes,
      }),
    }
  )
);
