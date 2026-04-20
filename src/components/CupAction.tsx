// DONE / SHAKE / SWIPE / DRAG — 컵 위 동일 위치에서 상태별 교체
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useSwipe } from '../hooks/useSwipe';
import { INGREDIENTS_MAP } from '../data/ingredients';
import type { CupIngredient } from '../store/gameStore';

export default function CupAction() {
  const { cupState, cupIngredients, finishFilling, startShaking, serveDrink } = useGameStore();

  const hasBase = cupIngredients.some((ci: CupIngredient) => INGREDIENTS_MAP[ci.ingredientId]?.category === 'base');

  const swipeHandlers = useSwipe({
    onSwipe: () => {
      if (cupState === 'READY_TO_SERVE') serveDrink();
    },
    onSwipeDelta: (delta) => {
      if (cupState === 'SHAKING') {
        useGameStore.getState().updateShakeGauge(delta * 0.5);
      }
    },
  });

  return (
    <AnimatePresence mode="wait">
      {cupState === 'FILLING' && hasBase && (
        <motion.button
          key="done"
          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          onClick={finishFilling}
          style={btnStyle('#A8C686')}
        >
          DONE ✓
        </motion.button>
      )}

      {cupState === 'READY_TO_SHAKE' && (
        <motion.button
          key="shake"
          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          onClick={startShaking}
          style={btnStyle('#F1948A')}
        >
          SHAKE
        </motion.button>
      )}

      {cupState === 'SHAKING' && (
        <motion.div
          key="swipe"
          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          {...swipeHandlers}
          style={{ ...btnStyle('#AED6F1'), userSelect: 'none' }}
        >
          ← SWIPE →
        </motion.div>
      )}

      {cupState === 'READY_TO_SERVE' && (
        <motion.div
          key="drag"
          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          {...swipeHandlers}
          style={{ ...btnStyle('#F9E79F'), cursor: 'grab', userSelect: 'none' }}
        >
          DRAG →
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function btnStyle(bg: string): CSSProperties {
  return {
    padding: '8px 20px',
    background: bg,
    border: 'none',
    borderRadius: 20,
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
    cursor: 'pointer',
    minWidth: 80,
  };
}
