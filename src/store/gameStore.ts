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

// ── Helpers ────────────────────────────────────────────────────────────────

function blendColors(colors: string[]): string {
  if (colors.length === 0) return '#FFFFFF';
  if (colors.length === 1) return colors[0];

  const parsed = colors.map(hex => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }));

  const avg = parsed.reduce((acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }), { r: 0, g: 0, b: 0 });
  const n = parsed.length;
  const r = Math.round(avg.r / n).toString(16).padStart(2, '0');
  const g = Math.round(avg.g / n).toString(16).padStart(2, '0');
  const b = Math.round(avg.b / n).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function checkSoftOrderCondition(condition: SoftOrderCondition, ingredients: CupIngredient[]): boolean {
  switch (condition.type) {
    case 'has_base': {
      if (condition.ingredientIds) {
        return ingredients.some(ci => condition.ingredientIds!.includes(ci.ingredientId));
      }
      return ingredients.some(ci => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base');
    }
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
  const baseTotalQty = ingredients
    .filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base')
    .reduce((sum, ci) => sum + ci.quantity, 0);
  if (baseTotalQty === 0) return 0;
  if (baseTotalQty === 1) return 0.33;
  if (baseTotalQty === 2) return 0.66;
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
  addIngredient: (ingredient: Ingredient) => void;
  finishFilling: () => void;
  startShaking: () => void;
  updateShakeGauge: (delta: number) => void;
  serveDrink: () => void;
  resetCup: () => void;
  rollSoftOrder: () => void;
  setCharacterPose: (pose: CharacterPose) => void;
}

let poseTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // ── Initial State ────────────────────────────────────────────────────
      cupState: 'IDLE',
      cupIngredients: [],
      cupLiquidColor: '#FFFFFF',
      cupLiquidLevel: 0,
      shakeGauge: 0,
      softOrder: null,
      isSoftOrderFulfilled: false,
      coins: 0,
      coinLog: [],
      recipes: [],
      characterPose: 'idle',
      showTitle: true,

      // ── Actions ──────────────────────────────────────────────────────────

      dismissTitle: () => set({ showTitle: false }),

      addIngredient: (ingredient) => {
        const { cupState, cupIngredients, softOrder } = get();
        if (cupState !== 'IDLE' && cupState !== 'FILLING') return;

        // Enforce top topping 1-tap limit
        if (ingredient.layer === 'top') {
          const already = cupIngredients.some(ci => ci.ingredientId === ingredient.id);
          if (already) return;
        }

        // Enforce base max 3 units
        if (ingredient.layer === 'body') {
          const baseTotal = cupIngredients
            .filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === 'body')
            .reduce((sum, ci) => sum + ci.quantity, 0);
          if (baseTotal >= 3) return;
        }

        const existing = cupIngredients.find(ci => ci.ingredientId === ingredient.id);
        const updated: CupIngredient[] = existing
          ? cupIngredients.map(ci => ci.ingredientId === ingredient.id ? { ...ci, quantity: ci.quantity + 1 } : ci)
          : [...cupIngredients, { ingredientId: ingredient.id, quantity: 1 }];

        const liquidColor = computeLiquidColor(updated);
        const liquidLevel = computeLiquidLevel(updated);

        // Soft order condition check
        let isSoftOrderFulfilled = get().isSoftOrderFulfilled;
        if (softOrder && !isSoftOrderFulfilled) {
          isSoftOrderFulfilled = checkSoftOrderCondition(softOrder.condition, updated);
        }

        // Character pose
        const pose: CharacterPose = ingredient.tool === 'pitcher' ? 'pitcher' : ingredient.tool === 'scoop' ? 'scoop' : 'drizzle';
        if (poseTimer) clearTimeout(poseTimer);
        poseTimer = setTimeout(() => {
          useGameStore.setState({ characterPose: 'idle' });
        }, 500);

        set({
          cupIngredients: updated,
          cupLiquidColor: liquidColor,
          cupLiquidLevel: liquidLevel,
          cupState: 'FILLING',
          characterPose: pose,
          isSoftOrderFulfilled,
        });
      },

      finishFilling: () => {
        const { cupState, cupIngredients } = get();
        if (cupState !== 'FILLING') return;
        const hasBase = cupIngredients.some(ci => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base');
        if (!hasBase) return;
        set({ cupState: 'READY_TO_SHAKE' });
      },

      startShaking: () => {
        const { cupState } = get();
        if (cupState !== 'READY_TO_SHAKE') return;
        set({ cupState: 'SHAKING', shakeGauge: 0, characterPose: 'shake' });
      },

      updateShakeGauge: (delta) => {
        const { cupState, shakeGauge } = get();
        if (cupState !== 'SHAKING') return;
        const next = Math.min(100, shakeGauge + Math.abs(delta));
        if (next >= 100) {
          set({ shakeGauge: 100, cupState: 'READY_TO_SERVE', characterPose: 'idle' });
        } else {
          set({ shakeGauge: next });
        }
      },

      serveDrink: () => {
        const { cupIngredients, cupLiquidColor, softOrder, isSoftOrderFulfilled, coins, coinLog, recipes } = get();

        const recipe: Recipe = {
          id: `recipe_${Date.now()}`,
          ingredients: cupIngredients,
          liquidColor: cupLiquidColor,
          createdAt: Date.now(),
        };

        const baseCoins = 10;
        const bonusCoins = softOrder && isSoftOrderFulfilled ? softOrder.bonusCoins : 0;
        const totalCoins = baseCoins + bonusCoins;

        const newCoinLog: CoinLogEntry[] = [
          ...coinLog,
          { amount: baseCoins, reason: 'serve_drink', timestamp: Date.now() },
          ...(bonusCoins > 0 ? [{ amount: bonusCoins, reason: 'soft_order_bonus', timestamp: Date.now() }] : []),
        ];

        set({
          coins: coins + totalCoins,
          coinLog: newCoinLog,
          recipes: [...recipes, recipe],
          cupState: 'SERVING',
        });

        setTimeout(() => {
          get().resetCup();
          get().rollSoftOrder();
          set({ cupState: 'IDLE' });
        }, 500);
      },

      resetCup: () => set({
        cupIngredients: [],
        cupLiquidColor: '#FFFFFF',
        cupLiquidLevel: 0,
        shakeGauge: 0,
        softOrder: null,
        isSoftOrderFulfilled: false,
        characterPose: 'idle',
      }),

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
          set({ softOrder: order, isSoftOrderFulfilled: false });
        } else {
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
