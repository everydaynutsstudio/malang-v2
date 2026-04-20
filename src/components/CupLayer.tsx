// 컵 내부 레이어 — bottom / body / top 각각 렌더링
import { motion } from 'framer-motion';
import { INGREDIENTS_MAP } from '../data/ingredients';
import type { CupIngredient } from '../store/gameStore';

interface Props {
  layer: 'bottom' | 'body' | 'top';
  ingredients: CupIngredient[];
  liquidColor?: string;
  liquidLevel?: number;
}

const BOTTOM_COLORS: Record<string, string> = {
  pearl: '#2a2a2a',
  jelly: 'rgba(255,200,200,0.7)',
  oreo: '#3a2a1a',
};

export default function CupLayer({ layer, ingredients, liquidColor = '#fff', liquidLevel = 0 }: Props) {
  const layerIngredients = ingredients.filter(ci => INGREDIENTS_MAP[ci.ingredientId]?.layer === layer);

  if (layer === 'body') {
    return (
      <motion.div
        animate={{ height: `${liquidLevel * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: liquidColor,
          opacity: 0.7,
        }}
      />
    );
  }

  if (layer === 'bottom') {
    return (
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', padding: '0 4px' }}>
        {layerIngredients.flatMap(ci => {
          const color = BOTTOM_COLORS[ci.ingredientId] ?? '#888';
          const count = ci.quantity >= 2 ? 7 : 3;
          return Array.from({ length: count }, (_, i) => (
            <motion.div
              key={`${ci.ingredientId}-${i}`}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: color }}
            />
          ));
        })}
      </div>
    );
  }

  // top layer
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {layerIngredients.map(ci => {
        if (ci.ingredientId === 'cream') {
          return (
            <motion.div
              key="cream"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              transition={{ type: 'spring' }}
              style={{ width: 80, height: 24, background: '#fff', borderRadius: '50%', opacity: 0.9 }}
            />
          );
        }
        if (ci.ingredientId === 'syrup') {
          return (
            <motion.div
              key="syrup"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ width: 40, height: 6, background: '#8B4513', borderRadius: 3 }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
