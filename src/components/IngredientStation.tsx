// 재료통 + TAP 인디케이터 — 탭 시 bounce + 재료 추가
import { motion, useAnimation } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { Ingredient } from '../data/ingredients';

interface Props {
  ingredient: Ingredient;
}

const STATION_COLORS: Record<string, string> = {
  milktea: '#D4A574',
  taro: '#B8A0D2',
  matcha: '#A8C686',
  pearl: '#2a2a2a',
  jelly: '#FFB6C1',
  oreo: '#5C4033',
  cream: '#FFFDE7',
  syrup: '#8B4513',
};

export default function IngredientStation({ ingredient }: Props) {
  const { cupState, softOrder, addIngredient } = useGameStore();
  const controls = useAnimation();

  const isActive = cupState === 'IDLE' || cupState === 'FILLING';
  const isHinted = softOrder?.hintIngredientIds.includes(ingredient.id) ?? false;

  function handleTap() {
    if (!isActive) return;
    controls.start({ scale: [1, 0.95, 1], transition: { duration: 0.3 } });
    addIngredient(ingredient);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* TAP bubble */}
      {isActive && (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{
            fontSize: 10,
            color: '#fff',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '2px 6px',
          }}
        >
          TAP
        </motion.div>
      )}

      {/* Station box (placeholder for PNG) */}
      <motion.div
        animate={controls}
        onClick={handleTap}
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: STATION_COLORS[ingredient.id] ?? '#888',
          border: isHinted ? '2px solid #FFD700' : '2px solid transparent',
          cursor: isActive ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          boxShadow: isHinted ? '0 0 8px #FFD700' : 'none',
        }}
      >
        {ingredient.nameKo}
      </motion.div>
    </div>
  );
}
